import { createHash } from 'node:crypto';
import type { Prisma, PrismaClient } from '@prisma/client';
import type { CartItem, CartItemOption, CartSyncLineInput } from '../models';
import { createCartLineId, mergeCartQuantity } from '../services/cartSync';

type Database = PrismaClient | Prisma.TransactionClient;

type StoredCart = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: { include: { images: true; inventory: true; seller: true } };
        variant: { include: { inventory: true } };
      };
    };
  };
}>;

interface PreparedLine {
  readonly lineKey: string;
  readonly productId: string;
  readonly variantId?: string | undefined;
  readonly customisation?: string | undefined;
  readonly quantity: number;
  readonly minimumQuantity: number;
  readonly maximumQuantity: number;
  readonly unitPriceInPaise: number;
}

const decimalToPaise = (value: { toString: () => string }): number =>
  Math.round(Number(value.toString()) * 100);

const createServerCartLineKey = (
  productId: string,
  variantId: string | undefined,
  customisation: string | undefined,
): string =>
  createHash('sha256')
    .update(`${productId}:${variantId ?? 'base'}:${customisation?.trim() ?? ''}`)
    .digest('hex');

const variantOptions = (
  variant: {
    material: string | null;
    colour: string | null;
    finish: string | null;
  } | null,
): readonly CartItemOption[] => {
  if (!variant) return [];
  return [
    ['Material', variant.material],
    ['Colour', variant.colour],
    ['Finish', variant.finish],
  ].flatMap(([label, value]) => (value ? [{ label: label ?? '', value }] : []));
};

export class PrismaCartRepository {
  constructor(private readonly database: PrismaClient) {}

  async synchronizeGuestCart(
    userId: string,
    sessionId: string,
    guestCartId: string,
    inputs: readonly CartSyncLineInput[],
  ): Promise<readonly CartItem[]> {
    const cartId = await this.database.$transaction(async (transaction) => {
      const cart = await this.findOrCreateCart(transaction, userId, sessionId);
      const previousMerge = await transaction.cartMerge.findUnique({
        where: { cartId_guestCartId: { cartId: cart.id, guestCartId } },
      });
      if (!previousMerge) {
        const preparedLines = await this.prepareLines(transaction, inputs);
        for (const line of preparedLines) {
          const existing = await transaction.cartItem.findUnique({
            where: { cartId_lineKey: { cartId: cart.id, lineKey: line.lineKey } },
          });
          await transaction.cartItem.upsert({
            where: { cartId_lineKey: { cartId: cart.id, lineKey: line.lineKey } },
            update: {
              quantity: mergeCartQuantity(
                existing?.quantity ?? 0,
                line.quantity,
                line.minimumQuantity,
                line.maximumQuantity,
              ),
              unitPrice: line.unitPriceInPaise / 100,
            },
            create: {
              cartId: cart.id,
              lineKey: line.lineKey,
              productId: line.productId,
              variantId: line.variantId ?? null,
              customisation: line.customisation ?? null,
              quantity: line.quantity,
              unitPrice: line.unitPriceInPaise / 100,
            },
          });
        }
        await transaction.cartMerge.create({
          data: { cartId: cart.id, sessionId, guestCartId },
        });
      }
      await transaction.cart.update({
        where: { id: cart.id },
        data: { sessionId, expiresAt: null },
      });
      return cart.id;
    });
    return this.loadCartItems(cartId);
  }

  async replaceAccountCart(
    userId: string,
    sessionId: string,
    inputs: readonly CartSyncLineInput[],
  ): Promise<readonly CartItem[]> {
    const cartId = await this.database.$transaction(async (transaction) => {
      const cart = await this.findOrCreateCart(transaction, userId, sessionId);
      const preparedLines = await this.prepareLines(transaction, inputs);
      await transaction.cartItem.deleteMany({ where: { cartId: cart.id } });
      if (preparedLines.length) {
        await transaction.cartItem.createMany({
          data: preparedLines.map((line) => ({
            cartId: cart.id,
            lineKey: line.lineKey,
            productId: line.productId,
            variantId: line.variantId ?? null,
            customisation: line.customisation ?? null,
            quantity: line.quantity,
            unitPrice: line.unitPriceInPaise / 100,
          })),
        });
      }
      await transaction.cart.update({
        where: { id: cart.id },
        data: { sessionId, expiresAt: null },
      });
      return cart.id;
    });
    return this.loadCartItems(cartId);
  }

  private async findOrCreateCart(
    database: Database,
    userId: string,
    sessionId: string,
  ): Promise<{ readonly id: string }> {
    return database.cart.upsert({
      where: { userId },
      update: { sessionId, expiresAt: null },
      create: { userId, sessionId, currency: 'INR' },
      select: { id: true },
    });
  }

  private async prepareLines(
    database: Database,
    inputs: readonly CartSyncLineInput[],
  ): Promise<readonly PreparedLine[]> {
    const prepared: PreparedLine[] = [];
    for (const input of inputs) {
      const product = await database.product.findUnique({
        where: { slug: input.productSlug },
        include: {
          inventory: true,
          seller: { include: { user: true } },
          variants: { include: { inventory: true } },
        },
      });
      if (
        !product ||
        product.status !== 'PUBLISHED' ||
        product.seller.verificationStatus !== 'APPROVED' ||
        product.seller.user.status !== 'ACTIVE'
      ) {
        continue;
      }
      const variant = input.variantId
        ? product.variants.find((candidate) => candidate.id === input.variantId)
        : null;
      if (input.variantId && (!variant || !variant.isActive)) continue;
      const inventory = variant?.inventory ?? product.inventory;
      if (!inventory) continue;
      const availableStock = Math.max(0, inventory.quantity - inventory.reserved);
      const maximumQuantity = Math.min(product.maxOrderQuantity ?? 10_000, availableStock);
      if (maximumQuantity < product.minOrderQuantity) continue;
      const quantity = Math.min(
        maximumQuantity,
        Math.max(product.minOrderQuantity, input.quantity),
      );
      prepared.push({
        lineKey: createServerCartLineKey(product.id, variant?.id, input.customisation),
        productId: product.id,
        ...(variant ? { variantId: variant.id } : {}),
        ...(input.customisation ? { customisation: input.customisation } : {}),
        quantity,
        minimumQuantity: product.minOrderQuantity,
        maximumQuantity,
        unitPriceInPaise:
          decimalToPaise(product.basePrice) + (variant ? decimalToPaise(variant.priceDelta) : 0),
      });
    }
    return prepared;
  }

  private async loadCartItems(cartId: string): Promise<readonly CartItem[]> {
    const cart: StoredCart | null = await this.database.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }] },
                inventory: true,
                seller: true,
              },
            },
            variant: { include: { inventory: true } },
          },
        },
      },
    });
    if (!cart) return [];
    return cart.items.flatMap((storedItem) => {
      const inventory = storedItem.variant?.inventory ?? storedItem.product.inventory;
      if (!inventory) return [];
      const availableStock = Math.max(0, inventory.quantity - inventory.reserved);
      const maximumQuantity = Math.min(
        storedItem.product.maxOrderQuantity ?? 10_000,
        availableStock,
      );
      if (maximumQuantity < storedItem.product.minOrderQuantity) return [];
      const selectedOptions = variantOptions(storedItem.variant);
      const input = {
        productId: storedItem.product.id,
        productSlug: storedItem.product.slug,
        productName: storedItem.product.name,
        sellerId: storedItem.product.seller.id,
        sellerName: storedItem.product.seller.storeName,
        ...(storedItem.variant
          ? { variantId: storedItem.variant.id, variantName: storedItem.variant.name }
          : {}),
        selectedOptions,
        ...(storedItem.customisation ? { customisation: storedItem.customisation } : {}),
        quantity: Math.min(maximumQuantity, storedItem.quantity),
        minimumQuantity: storedItem.product.minOrderQuantity,
        maximumQuantity,
        availableStock,
        unitPriceInPaise:
          decimalToPaise(storedItem.product.basePrice) +
          (storedItem.variant ? decimalToPaise(storedItem.variant.priceDelta) : 0),
        imageUrl: storedItem.product.images[0]?.url ?? '/catalogue/hero-studio.svg',
      } satisfies Omit<CartItem, 'lineId'>;
      return [{ ...input, lineId: createCartLineId(input) }];
    });
  }
}
