declare module '@prisma/client' {
  export enum ProductStatus {
    DRAFT = 'DRAFT',
    PENDING_REVIEW = 'PENDING_REVIEW',
    CHANGES_REQUESTED = 'CHANGES_REQUESTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PUBLISHED = 'PUBLISHED',
    PAUSED = 'PAUSED',
    ARCHIVED = 'ARCHIVED',
  }

  export enum SellerVerificationStatus {
    NOT_APPLIED = 'NOT_APPLIED',
    PENDING = 'PENDING',
    CHANGES_REQUESTED = 'CHANGES_REQUESTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SUSPENDED = 'SUSPENDED',
  }

  export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    SELLER = 'SELLER',
    ADMIN = 'ADMIN',
  }

  export namespace Prisma {
    class PrismaClientKnownRequestError extends Error {
      code: string;
      meta?: Record<string, unknown>;
      clientVersion: string;
    }
  }

  type PrismaDelegate = {
    create: (...args: any[]) => any;
    deleteMany: (...args: any[]) => any;
    findFirst: (...args: any[]) => any;
    findUnique: (...args: any[]) => any;
    update: (...args: any[]) => any;
    upsert: (...args: any[]) => any;
  };

  export class PrismaClient {
    account: PrismaDelegate;
    category: PrismaDelegate;
    favourite: PrismaDelegate;
    product: PrismaDelegate;
    sellerProfile: PrismaDelegate;
    session: PrismaDelegate;
    user: PrismaDelegate;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
  }
}
