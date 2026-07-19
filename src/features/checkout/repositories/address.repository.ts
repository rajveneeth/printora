import type { PrismaClient } from '@prisma/client';
import type { AddressSummary } from '../models';
import type { AddressInput } from '../schemas';

const toAddressSummary = (address: {
  id: string;
  kind: 'SHIPPING' | 'BILLING' | 'BOTH';
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}): AddressSummary => ({
  id: address.id,
  kind: address.kind,
  fullName: address.fullName,
  phone: address.phone,
  line1: address.line1,
  ...(address.line2 ? { line2: address.line2 } : {}),
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
  isDefault: address.isDefault,
});

export class PrismaAddressRepository {
  constructor(private readonly database: PrismaClient) {}

  async listByUser(userId: string): Promise<readonly AddressSummary[]> {
    const addresses = await this.database.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return addresses.map(toAddressSummary);
  }

  async create(userId: string, input: AddressInput): Promise<AddressSummary> {
    return this.database.$transaction(async (transaction) => {
      const addressCount = await transaction.address.count({ where: { userId } });
      const shouldSetDefault = input.isDefault || addressCount === 0;
      if (shouldSetDefault) {
        await transaction.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      const address = await transaction.address.create({
        data: {
          userId,
          kind: input.kind,
          fullName: input.fullName,
          phone: input.phone,
          line1: input.line1,
          line2: input.line2 || null,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
          isDefault: shouldSetDefault,
        },
      });
      return toAddressSummary(address);
    });
  }

  async update(userId: string, addressId: string, input: AddressInput): Promise<AddressSummary> {
    return this.database.$transaction(async (transaction) => {
      const existing = await transaction.address.findFirst({ where: { id: addressId, userId } });
      if (!existing) throw new Error('Delivery address not found.');
      if (input.isDefault) {
        await transaction.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      const address = await transaction.address.update({
        where: { id: existing.id },
        data: {
          kind: input.kind,
          fullName: input.fullName,
          phone: input.phone,
          line1: input.line1,
          line2: input.line2 || null,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
          isDefault: input.isDefault || existing.isDefault,
        },
      });
      return toAddressSummary(address);
    });
  }

  async setDefault(userId: string, addressId: string): Promise<void> {
    await this.database.$transaction(async (transaction) => {
      const address = await transaction.address.findFirst({ where: { id: addressId, userId } });
      if (!address) throw new Error('Delivery address not found.');
      await transaction.address.updateMany({ where: { userId }, data: { isDefault: false } });
      await transaction.address.update({ where: { id: address.id }, data: { isDefault: true } });
    });
  }

  async delete(userId: string, addressId: string): Promise<void> {
    await this.database.$transaction(async (transaction) => {
      const address = await transaction.address.findFirst({ where: { id: addressId, userId } });
      if (!address) throw new Error('Delivery address not found.');
      await transaction.address.delete({ where: { id: address.id } });
      if (address.isDefault) {
        const replacement = await transaction.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        if (replacement) {
          await transaction.address.update({
            where: { id: replacement.id },
            data: { isDefault: true },
          });
        }
      }
    });
  }
}
