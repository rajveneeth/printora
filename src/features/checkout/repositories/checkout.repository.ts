import { randomBytes } from 'node:crypto';
import {
  AccountStatus,
  AddressKind,
  CheckoutStatus,
  OrderStatus,
  PaymentStatus,
  Prisma,
  type PrismaClient,
  ProductStatus,
  SellerVerificationStatus,
} from '@prisma/client';
import { calculateCartTotals, calculateLineTax, calculateShippingBySeller } from '@/features/cart';
import type { ProviderPaymentResult } from '@/lib/payments';
import type {
  CheckoutPaymentRecord,
  CreatePendingCheckoutPersistenceInput,
  FinalizePaymentPersistenceInput,
  PaymentFinalizationRecord,
  PendingCheckoutRecord,
} from './checkoutRepository.model';

const checkoutLifetimeInMilliseconds = 30 * 60 * 1000;

const decimalToPaise = (amount: Prisma.Decimal): number =>
  amount.mul(100).toDecimalPlaces(0).toNumber();

const paiseToRupees = (amountInPaise: number): string => (amountInPaise / 100).toFixed(2);

const createOrderNumber = (): string =>
  `FMV-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;

interface PreparedOrderItem {
  readonly productId: string;
  readonly variantId?: string | undefined;
  readonly inventoryId: string;
  readonly inventoryQuantity: number;
  readonly inventoryReserved: number;
  readonly sellerId: string;
  readonly sellerName: string;
  readonly productName: string;
  readonly variantSnapshot?: {
    readonly name: string;
    readonly material: string | null;
    readonly colour: string | null;
    readonly finish: string | null;
  };
  readonly customisation?: string | undefined;
  readonly productImage?: string | undefined;
  readonly quantity: number;
  readonly unitPriceInPaise: number;
  readonly taxInPaise: number;
  readonly shippingInPaise: number;
}

export class StockConflictError extends Error {}

export class PrismaCheckoutRepository {
  constructor(private readonly database: PrismaClient) {}

  async createPendingCheckout(
    input: CreatePendingCheckoutPersistenceInput,
  ): Promise<PendingCheckoutRecord> {
    return this.database.$transaction(
      async (transaction) => {
        const existing = await transaction.checkoutSession.findUnique({
          where: { idempotencyKey: input.checkout.idempotencyKey },
          include: { order: true, payment: true },
        });
        if (existing) {
          if (existing.userId !== input.userId || !existing.payment) {
            throw new Error('This checkout request cannot be reused.');
          }
          if (existing.payment.status === PaymentStatus.FAILED) {
            throw new Error('This checkout attempt has ended. Start a new payment attempt.');
          }
          return {
            paymentId: existing.payment.id,
            orderId: existing.order.id,
            orderNumber: existing.order.orderNumber,
            provider: existing.provider,
            ...(existing.payment.providerOrderId
              ? { providerOrderId: existing.payment.providerOrderId }
              : {}),
            amountInPaise: decimalToPaise(existing.payment.amount),
            currency: 'INR',
            isExisting: true,
          };
        }

        const address = await transaction.address.findFirst({
          where: {
            id: input.checkout.addressId,
            userId: input.userId,
            kind: { in: [AddressKind.SHIPPING, AddressKind.BOTH] },
          },
        });
        if (!address) throw new Error('Choose a delivery address that belongs to your account.');

        const productSlugs = Array.from(
          new Set(input.checkout.items.map((item) => item.productSlug)),
        );
        const products = await transaction.product.findMany({
          where: { slug: { in: productSlugs } },
          include: {
            seller: { include: { user: true } },
            inventory: true,
            variants: { include: { inventory: true } },
            images: { orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }] },
          },
        });
        const productsBySlug = new Map(products.map((product) => [product.slug, product]));
        const requestedQuantities = new Map<string, number>();
        input.checkout.items.forEach((item) => {
          requestedQuantities.set(
            item.productSlug,
            (requestedQuantities.get(item.productSlug) ?? 0) + item.quantity,
          );
        });
        const provisionalItems = input.checkout.items.map((requestedItem) => {
          const product = productsBySlug.get(requestedItem.productSlug);
          if (
            !product ||
            product.currency !== 'INR' ||
            product.status !== ProductStatus.PUBLISHED ||
            !product.publishedAt ||
            product.seller.verificationStatus !== SellerVerificationStatus.APPROVED ||
            product.seller.user.status !== AccountStatus.ACTIVE
          ) {
            throw new StockConflictError(
              `${requestedItem.productSlug} is no longer available for checkout.`,
            );
          }
          const selectedOption = (label: string): string | undefined =>
            requestedItem.selectedOptions.find((option) => option.label === label)?.value;
          const selectedMaterial = selectedOption('Material');
          const selectedColour = selectedOption('Colour');
          const selectedFinish = selectedOption('Finish');
          const variant = requestedItem.variantId
            ? (product.variants.find(
                (candidate) => candidate.id === requestedItem.variantId && candidate.isActive,
              ) ??
              product.variants.find(
                (candidate) =>
                  candidate.isActive &&
                  candidate.material === selectedMaterial &&
                  candidate.colour === selectedColour &&
                  candidate.finish === selectedFinish,
              ))
            : undefined;
          if (requestedItem.variantId && !variant) {
            throw new StockConflictError(`${product.name} has an unavailable option.`);
          }
          if (
            !requestedItem.variantId &&
            product.variants.some((candidate) => candidate.isActive)
          ) {
            throw new StockConflictError(`Choose an available option for ${product.name}.`);
          }
          const inventory = variant?.inventory ?? product.inventory;
          if (!inventory) throw new StockConflictError(`${product.name} is not in stock.`);
          const requestedProductQuantity = requestedQuantities.get(product.slug) ?? 0;
          if (
            requestedProductQuantity < product.minOrderQuantity ||
            (product.maxOrderQuantity !== null &&
              requestedProductQuantity > product.maxOrderQuantity)
          ) {
            throw new StockConflictError(`The quantity for ${product.name} is outside its limit.`);
          }
          const availableStock = inventory.quantity - inventory.reserved;
          if (requestedItem.quantity > availableStock) {
            throw new StockConflictError(
              `Only ${Math.max(availableStock, 0)} ${product.name} remain.`,
            );
          }
          const unitPriceInPaise =
            decimalToPaise(product.basePrice) + (variant ? decimalToPaise(variant.priceDelta) : 0);
          if (unitPriceInPaise !== requestedItem.displayedUnitPriceInPaise) {
            throw new StockConflictError(
              `The price of ${product.name} changed. Review your shopping bag before paying.`,
            );
          }
          return {
            productId: product.id,
            ...(variant ? { variantId: variant.id } : {}),
            inventoryId: inventory.id,
            inventoryQuantity: inventory.quantity,
            inventoryReserved: inventory.reserved,
            sellerId: product.sellerId,
            sellerName: product.seller.storeName,
            productName: product.name,
            ...(variant
              ? {
                  variantSnapshot: {
                    name: variant.name,
                    material: variant.material,
                    colour: variant.colour,
                    finish: variant.finish,
                  },
                }
              : {}),
            ...(requestedItem.customisation ? { customisation: requestedItem.customisation } : {}),
            ...(product.images[0]?.url ? { productImage: product.images[0].url } : {}),
            quantity: requestedItem.quantity,
            unitPriceInPaise,
          };
        });

        const shippingBySeller = calculateShippingBySeller(provisionalItems);
        const allocatedShipping = new Set<string>();
        const preparedItems: readonly PreparedOrderItem[] = provisionalItems.map((item) => {
          const shippingInPaise = allocatedShipping.has(item.sellerId)
            ? 0
            : (shippingBySeller.get(item.sellerId) ?? 0);
          allocatedShipping.add(item.sellerId);
          return {
            ...item,
            taxInPaise: calculateLineTax(item),
            shippingInPaise,
          };
        });
        const totals = calculateCartTotals(preparedItems);

        const reservations = new Map<
          string,
          { readonly quantity: number; readonly expectedReserved: number; readonly stock: number }
        >();
        preparedItems.forEach((item) => {
          const current = reservations.get(item.inventoryId);
          reservations.set(item.inventoryId, {
            quantity: (current?.quantity ?? 0) + item.quantity,
            expectedReserved: item.inventoryReserved,
            stock: item.inventoryQuantity,
          });
        });
        for (const [inventoryId, reservation] of reservations) {
          const reserved = await transaction.inventory.updateMany({
            where: {
              id: inventoryId,
              reserved: reservation.expectedReserved,
              quantity: { gte: reservation.expectedReserved + reservation.quantity },
            },
            data: { reserved: { increment: reservation.quantity } },
          });
          if (reserved.count !== 1 || reservation.stock < reservation.quantity) {
            throw new StockConflictError('Stock changed while checkout was being prepared.');
          }
        }

        const order = await transaction.order.create({
          data: {
            orderNumber: createOrderNumber(),
            buyerId: input.userId,
            status: OrderStatus.PENDING_PAYMENT,
            currency: 'INR',
            subtotal: paiseToRupees(totals.subtotalInPaise),
            taxTotal: paiseToRupees(totals.taxInPaise),
            shippingTotal: paiseToRupees(totals.shippingInPaise),
            grandTotal: paiseToRupees(totals.totalInPaise),
            items: {
              create: preparedItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId ?? null,
                sellerId: item.sellerId,
                productNameSnapshot: item.productName,
                sellerNameSnapshot: item.sellerName,
                ...(item.variantSnapshot ? { variantSnapshot: item.variantSnapshot } : {}),
                customisationSnapshot: item.customisation ?? null,
                productImageSnapshot: item.productImage ?? null,
                quantity: item.quantity,
                unitPrice: paiseToRupees(item.unitPriceInPaise),
                tax: paiseToRupees(item.taxInPaise),
                shippingFee: paiseToRupees(item.shippingInPaise),
              })),
            },
            address: {
              create: {
                kind: address.kind,
                fullName: address.fullName,
                phone: address.phone,
                line1: address.line1,
                line2: address.line2,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country,
              },
            },
            statusEvents: {
              create: {
                status: OrderStatus.PENDING_PAYMENT,
                note: 'Checkout created and inventory reserved.',
              },
            },
            fulfilments: {
              create: [...new Set(preparedItems.map((item) => item.sellerId))].map((sellerId) => ({
                sellerId,
                status: OrderStatus.PENDING_PAYMENT,
              })),
            },
          },
        });
        const checkout = await transaction.checkoutSession.create({
          data: {
            userId: input.userId,
            orderId: order.id,
            addressId: address.id,
            idempotencyKey: input.checkout.idempotencyKey,
            provider: input.provider,
            status: CheckoutStatus.CREATED,
            expiresAt: new Date(Date.now() + checkoutLifetimeInMilliseconds),
          },
        });
        const payment = await transaction.payment.create({
          data: {
            checkoutSessionId: checkout.id,
            orderId: order.id,
            provider: input.provider,
            status: PaymentStatus.PENDING,
            amount: paiseToRupees(totals.totalInPaise),
            currency: 'INR',
          },
        });
        return {
          paymentId: payment.id,
          orderId: order.id,
          orderNumber: order.orderNumber,
          provider: input.provider,
          amountInPaise: totals.totalInPaise,
          currency: 'INR',
          isExisting: false,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async attachProviderOrder(paymentId: string, providerOrderId: string): Promise<void> {
    await this.database.$transaction(async (transaction) => {
      const payment = await transaction.payment.findUnique({ where: { id: paymentId } });
      if (!payment) throw new Error('Payment record not found.');
      if (payment.providerOrderId && payment.providerOrderId !== providerOrderId) {
        throw new Error('A different provider order is already attached.');
      }
      await transaction.payment.update({
        where: { id: payment.id },
        data: { providerOrderId },
      });
      await transaction.checkoutSession.update({
        where: { id: payment.checkoutSessionId },
        data: { status: CheckoutStatus.PAYMENT_PENDING },
      });
    });
  }

  async findPaymentForUser(
    userId: string,
    paymentId: string,
  ): Promise<CheckoutPaymentRecord | null> {
    const payment = await this.database.payment.findFirst({
      where: { id: paymentId, order: { buyerId: userId } },
      include: { order: true },
    });
    if (!payment?.providerOrderId) return null;
    return {
      paymentId: payment.id,
      orderNumber: payment.order.orderNumber,
      provider: payment.provider,
      providerOrderId: payment.providerOrderId,
      amountInPaise: decimalToPaise(payment.amount),
      currency: 'INR',
      status: payment.status,
    };
  }

  async findPaymentByProviderOrderId(
    providerOrderId: string,
  ): Promise<CheckoutPaymentRecord | null> {
    const payment = await this.database.payment.findUnique({
      where: { providerOrderId },
      include: { order: true },
    });
    if (!payment?.providerOrderId) return null;
    return {
      paymentId: payment.id,
      orderNumber: payment.order.orderNumber,
      provider: payment.provider,
      providerOrderId: payment.providerOrderId,
      amountInPaise: decimalToPaise(payment.amount),
      currency: 'INR',
      status: payment.status,
    };
  }

  async finalizePayment(
    input: FinalizePaymentPersistenceInput,
  ): Promise<PaymentFinalizationRecord> {
    return this.database.$transaction(
      async (transaction) => {
        const payment = await transaction.payment.findUnique({
          where: { id: input.paymentId },
          include: { order: { include: { items: true } } },
        });
        if (!payment) throw new Error('Payment record not found.');
        if (payment.status !== PaymentStatus.PENDING) {
          return {
            status: payment.status,
            orderNumber: payment.order.orderNumber,
            ...(payment.failureReason ? { message: payment.failureReason } : {}),
          };
        }
        const duplicateEvent = await transaction.paymentEvent.findUnique({
          where: { providerEventId: input.result.providerEventId },
        });
        if (duplicateEvent) {
          if (duplicateEvent.paymentId !== payment.id) {
            throw new Error('The provider event belongs to a different payment.');
          }
          return { status: payment.status, orderNumber: payment.order.orderNumber };
        }
        await transaction.paymentEvent.create({
          data: {
            paymentId: payment.id,
            providerEventId: input.result.providerEventId,
            eventType: input.result.eventType,
            payload: input.result.payload,
          },
        });
        if (input.result.status === 'PENDING') {
          await transaction.payment.update({
            where: { id: payment.id },
            data: { providerPaymentId: input.result.providerPaymentId },
          });
          return {
            status: 'PENDING',
            orderNumber: payment.order.orderNumber,
            message: input.result.reason,
          };
        }
        const reservations = await this.getOrderReservations(transaction, payment.order.items);
        if (input.result.status === 'SUCCEEDED') {
          for (const [inventoryId, quantity] of reservations) {
            const consumed = await transaction.inventory.updateMany({
              where: { id: inventoryId, quantity: { gte: quantity }, reserved: { gte: quantity } },
              data: { quantity: { decrement: quantity }, reserved: { decrement: quantity } },
            });
            if (consumed.count !== 1) {
              throw new StockConflictError('Reserved inventory could not be fulfilled safely.');
            }
          }
          await transaction.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.SUCCEEDED,
              providerPaymentId: input.result.providerPaymentId,
              verifiedAt: new Date(),
              failureReason: null,
            },
          });
          await transaction.checkoutSession.update({
            where: { id: payment.checkoutSessionId },
            data: { status: CheckoutStatus.COMPLETED, completedAt: new Date() },
          });
          await transaction.order.update({
            where: { id: payment.orderId },
            data: {
              status: OrderStatus.PAID,
              statusEvents: {
                create: { status: OrderStatus.PAID, note: 'Payment verified by the provider.' },
              },
            },
          });
          await transaction.sellerOrderFulfilment.updateMany({
            where: { orderId: payment.orderId },
            data: { status: OrderStatus.PAID },
          });
          return { status: 'SUCCEEDED', orderNumber: payment.order.orderNumber };
        }
        await this.releaseReservations(transaction, reservations);
        await transaction.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            providerPaymentId: input.result.providerPaymentId ?? null,
            failureReason: input.result.reason,
            verifiedAt: new Date(),
          },
        });
        await transaction.checkoutSession.update({
          where: { id: payment.checkoutSessionId },
          data: { status: CheckoutStatus.FAILED, completedAt: new Date() },
        });
        await transaction.order.update({
          where: { id: payment.orderId },
          data: {
            status: OrderStatus.CANCELLED,
            statusEvents: {
              create: { status: OrderStatus.CANCELLED, note: 'Payment was not completed.' },
            },
          },
        });
        await transaction.sellerOrderFulfilment.updateMany({
          where: { orderId: payment.orderId },
          data: { status: OrderStatus.CANCELLED },
        });
        return {
          status: 'FAILED',
          orderNumber: payment.order.orderNumber,
          message: input.result.reason,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async failProviderOrder(paymentId: string, reason: string): Promise<void> {
    await this.finalizePayment({
      paymentId,
      result: {
        status: 'FAILED',
        providerEventId: `provider-order:${paymentId}:failed`,
        eventType: 'provider.order.failed',
        reason,
        payload: { reason },
      },
    });
  }

  private async getOrderReservations(
    transaction: Prisma.TransactionClient,
    items: readonly {
      productId: string | null;
      variantId: string | null;
      quantity: number;
    }[],
  ): Promise<ReadonlyMap<string, number>> {
    const reservations = new Map<string, number>();
    for (const item of items) {
      const inventory = item.variantId
        ? await transaction.inventory.findUnique({ where: { variantId: item.variantId } })
        : item.productId
          ? await transaction.inventory.findUnique({ where: { productId: item.productId } })
          : null;
      if (!inventory) throw new StockConflictError('Reserved inventory record is missing.');
      reservations.set(inventory.id, (reservations.get(inventory.id) ?? 0) + item.quantity);
    }
    return reservations;
  }

  private async releaseReservations(
    transaction: Prisma.TransactionClient,
    reservations: ReadonlyMap<string, number>,
  ): Promise<void> {
    for (const [inventoryId, quantity] of reservations) {
      const released = await transaction.inventory.updateMany({
        where: { id: inventoryId, reserved: { gte: quantity } },
        data: { reserved: { decrement: quantity } },
      });
      if (released.count !== 1) {
        throw new StockConflictError('Reserved inventory could not be released safely.');
      }
    }
  }
}

export type { ProviderPaymentResult };
