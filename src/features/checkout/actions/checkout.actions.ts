'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { createPaymentProvider } from '@/lib/payments';
import { prisma } from '@/lib/prisma';
import type {
  AddressActionResult,
  CheckoutActionResult,
  PaymentConfirmationResult,
} from '../models';
import {
  PrismaAddressRepository,
  PrismaCheckoutRepository,
  StockConflictError,
} from '../repositories';
import { addressSchema, createCheckoutSchema, paymentConfirmationSchema } from '../schemas';
import { CheckoutService } from '../services';

const addressRepository = new PrismaAddressRepository(prisma);
const checkoutRepository = new PrismaCheckoutRepository(prisma);

const actionFailureMessage = (error: unknown): string => {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? 'Check the submitted fields.';
  }
  if (error instanceof StockConflictError) return error.message;
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
    return 'Stock changed during checkout. Review your shopping bag and try again.';
  }
  if (error instanceof Error && error.constructor.name.startsWith('Prisma')) {
    return 'Checkout data is temporarily unavailable. Try again.';
  }
  if (error instanceof Error) return error.message;
  return 'The request could not be completed.';
};

export const createAddressAction = async (values: unknown): Promise<AddressActionResult> => {
  try {
    const session = await requireSession();
    const address = await addressRepository.create(session.user.id, addressSchema.parse(values));
    revalidatePath('/checkout');
    revalidatePath('/account/addresses');
    return { status: 'success', message: 'Delivery address added.', addressId: address.id };
  } catch (error) {
    return { status: 'error', message: actionFailureMessage(error) };
  }
};

export const updateAddressAction = async (
  addressId: string,
  values: unknown,
): Promise<AddressActionResult> => {
  try {
    const session = await requireSession();
    await addressRepository.update(session.user.id, addressId, addressSchema.parse(values));
    revalidatePath('/checkout');
    revalidatePath('/account/addresses');
    return { status: 'success', message: 'Delivery address updated.', addressId };
  } catch (error) {
    return { status: 'error', message: actionFailureMessage(error) };
  }
};

export const setDefaultAddressAction = async (addressId: string): Promise<AddressActionResult> => {
  try {
    const session = await requireSession();
    await addressRepository.setDefault(session.user.id, addressId);
    revalidatePath('/checkout');
    revalidatePath('/account/addresses');
    return { status: 'success', message: 'Default delivery address updated.', addressId };
  } catch (error) {
    return { status: 'error', message: actionFailureMessage(error) };
  }
};

export const deleteAddressAction = async (addressId: string): Promise<AddressActionResult> => {
  try {
    const session = await requireSession();
    await addressRepository.delete(session.user.id, addressId);
    revalidatePath('/checkout');
    revalidatePath('/account/addresses');
    return { status: 'success', message: 'Delivery address removed.' };
  } catch (error) {
    return { status: 'error', message: actionFailureMessage(error) };
  }
};

export const createCheckoutAction = async (values: unknown): Promise<CheckoutActionResult> => {
  try {
    const session = await requireSession();
    const service = new CheckoutService(checkoutRepository, createPaymentProvider());
    return await service.createCheckout(session.user.id, createCheckoutSchema.parse(values));
  } catch (error) {
    return { status: 'error', message: actionFailureMessage(error) };
  }
};

export const confirmPaymentAction = async (values: unknown): Promise<PaymentConfirmationResult> => {
  try {
    const session = await requireSession();
    const service = new CheckoutService(checkoutRepository, createPaymentProvider());
    const result = await service.confirmPayment(
      session.user.id,
      paymentConfirmationSchema.parse(values),
    );
    revalidatePath('/account');
    revalidatePath('/checkout/success');
    return result;
  } catch (error) {
    return { status: 'error', message: actionFailureMessage(error) };
  }
};
