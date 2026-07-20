'use server';

import { Prisma } from '@prisma/client';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  clearSessionCookie,
  createSession,
  getCurrentSession,
  setSessionCookie,
} from '@/lib/auth/session';
import { getRequestMetadata } from '@/lib/auth/request';
import { createSellerSlugBase, normaliseCredentialEmail } from '@/lib/auth/credentials';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { resolvePostAuthPath } from '@/lib/auth/roles';
import { enforceRateLimit, RateLimitExceededError } from '@/lib/security';
import { signInSchema, signUpSchema } from '../schemas';

export interface AuthActionState {
  message: string;
}

const getStringValue = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

const invalidCredentialHash = hashPassword('invalid-credential-sentinel');

const authRateLimitMessage = (error: unknown): AuthActionState | null => {
  if (!(error instanceof RateLimitExceededError)) return null;
  const minutes = Math.max(1, Math.ceil(error.retryAfterInSeconds / 60));
  return {
    message: `Too many attempts. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`,
  };
};

const enforceAuthLimits = async (
  operation: 'sign-in' | 'sign-up',
  email: string,
): Promise<Awaited<ReturnType<typeof getRequestMetadata>>> => {
  const metadata = await getRequestMetadata();
  const ipAddress = metadata.ipAddress ?? 'unknown';
  await Promise.all([
    enforceRateLimit(`${ipAddress}:${email}`, {
      scope: `${operation}:identity`,
      limit: operation === 'sign-in' ? 5 : 3,
      windowInMilliseconds: operation === 'sign-in' ? 15 * 60_000 : 60 * 60_000,
    }),
    enforceRateLimit(ipAddress, {
      scope: `${operation}:ip`,
      limit: operation === 'sign-in' ? 30 : 10,
      windowInMilliseconds: operation === 'sign-in' ? 15 * 60_000 : 60 * 60_000,
    }),
  ]);
  return metadata;
};

const createUniqueSellerSlug = async (name: string): Promise<string> => {
  const baseSlug = `${createSellerSlugBase(name)}-studio`;
  let candidate = baseSlug;
  let suffix = 2;
  while (await prisma.sellerProfile.findUnique({ where: { storeSlug: candidate } })) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
};

const getConstraintMessage = (error: unknown): AuthActionState | null => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return null;
  }
  return {
    message: 'An account could not be created with those details.',
  };
};

export const signUpAction = async (
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  const parsed = signUpSchema.safeParse({
    email: getStringValue(formData, 'email'),
    password: getStringValue(formData, 'password'),
    name: getStringValue(formData, 'name'),
    role: getStringValue(formData, 'role'),
  });
  if (!parsed.success) {
    return { message: 'Enter a valid name, email, password, and role.' };
  }
  const email = normaliseCredentialEmail(parsed.data.email);
  let requestMetadata: Awaited<ReturnType<typeof getRequestMetadata>>;
  try {
    requestMetadata = await enforceAuthLimits('sign-up', email);
  } catch (error) {
    return (
      authRateLimitMessage(error) ?? { message: 'Account creation is temporarily unavailable.' }
    );
  }
  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  });
  if (existingUser) {
    return { message: 'An account could not be created with those details.' };
  }
  const storeSlug =
    parsed.data.role === 'SELLER' ? await createUniqueSellerSlug(parsed.data.name) : '';
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        role: parsed.data.role,
        accounts: {
          create: {
            providerId: 'credentials',
            accountId: email,
            password: hashPassword(parsed.data.password),
          },
        },
        buyerProfile: { create: { displayName: parsed.data.name } },
        ...(parsed.data.role === 'SELLER'
          ? {
              sellerProfile: {
                create: {
                  storeName: `${parsed.data.name}'s Studio`,
                  storeSlug,
                  description: 'New seller profile awaiting marketplace verification.',
                  contactEmail: email,
                  originCity: 'Not provided',
                  originState: 'Not provided',
                  originPostalCode: '000000',
                  supportedMaterials: [],
                  printTechnologies: [],
                  verificationStatus: 'PENDING',
                },
              },
            }
          : {}),
      },
    });
    const token = await createSession(user.id, requestMetadata);
    await setSessionCookie(token);
  } catch (error) {
    const constraintMessage = getConstraintMessage(error);
    if (constraintMessage) {
      return constraintMessage;
    }
    throw error;
  }
  redirect(resolvePostAuthPath(parsed.data.role, getStringValue(formData, 'returnTo')) as Route);
};

export const signInAction = async (
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  const parsed = signInSchema.safeParse({
    email: getStringValue(formData, 'email'),
    password: getStringValue(formData, 'password'),
  });
  if (!parsed.success) {
    return { message: 'Enter a valid email and password.' };
  }
  const email = normaliseCredentialEmail(parsed.data.email);
  let requestMetadata: Awaited<ReturnType<typeof getRequestMetadata>>;
  try {
    requestMetadata = await enforceAuthLimits('sign-in', email);
  } catch (error) {
    return authRateLimitMessage(error) ?? { message: 'Sign-in is temporarily unavailable.' };
  }
  const account = await prisma.account.findUnique({
    include: { user: true },
    where: { providerId_accountId: { providerId: 'credentials', accountId: email } },
  });
  const passwordMatches = verifyPassword(
    parsed.data.password,
    account?.password ?? invalidCredentialHash,
  );
  if (!account?.password || !passwordMatches || account.user.status !== 'ACTIVE') {
    return { message: 'Email or password is incorrect.' };
  }
  const previousSession = await getCurrentSession();
  if (previousSession) {
    await prisma.session.update({
      where: { id: previousSession.id },
      data: { revokedAt: new Date() },
    });
  }
  await prisma.user.update({ data: { lastActiveAt: new Date() }, where: { id: account.userId } });
  const token = await createSession(account.userId, requestMetadata);
  await setSessionCookie(token);
  redirect(resolvePostAuthPath(account.user.role, getStringValue(formData, 'returnTo')) as Route);
};

export const signOutAction = async (): Promise<void> => {
  const session = await getCurrentSession();
  if (session) {
    await prisma.session.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  await clearSessionCookie();
  redirect('/sign-in');
};
