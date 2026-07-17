'use server';

import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { clearSessionCookie, createSession, setSessionCookie, getCurrentSession } from '@/lib/auth/session';
import { createSellerSlugBase, normaliseCredentialEmail } from '@/lib/auth/credentials';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signInSchema, signUpSchema } from '../schemas';

export interface AuthActionState {
  message: string;
}

const getStringValue = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
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
  return { message: 'An account or seller profile already exists with these details. Please sign in or adjust your seller name.' };
};

export const signUpAction = async (_state: AuthActionState, formData: FormData): Promise<AuthActionState> => {
  const parsed = signUpSchema.safeParse({ email: getStringValue(formData, 'email'), password: getStringValue(formData, 'password'), name: getStringValue(formData, 'name'), role: getStringValue(formData, 'role') });
  if (!parsed.success) {
    return { message: 'Enter a valid name, email, password, and role.' };
  }
  const email = normaliseCredentialEmail(parsed.data.email);
  const existingUser = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
  if (existingUser) {
    return { message: 'An account already exists for this email.' };
  }
  const storeSlug = parsed.data.role === 'SELLER' ? await createUniqueSellerSlug(parsed.data.name) : '';
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        role: parsed.data.role,
        accounts: { create: { providerId: 'credentials', accountId: email, password: hashPassword(parsed.data.password) } },
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
    const token = await createSession(user.id);
    await setSessionCookie(token);
  } catch (error) {
    const constraintMessage = getConstraintMessage(error);
    if (constraintMessage) {
      return constraintMessage;
    }
    throw error;
  }
  redirect(parsed.data.role === 'SELLER' ? '/seller' : '/account');
};

export const signInAction = async (_state: AuthActionState, formData: FormData): Promise<AuthActionState> => {
  const parsed = signInSchema.safeParse({ email: getStringValue(formData, 'email'), password: getStringValue(formData, 'password') });
  if (!parsed.success) {
    return { message: 'Enter a valid email and password.' };
  }
  const email = normaliseCredentialEmail(parsed.data.email);
  const account = await prisma.account.findUnique({ include: { user: true }, where: { providerId_accountId: { providerId: 'credentials', accountId: email } } });
  if (!account?.password || !verifyPassword(parsed.data.password, account.password) || account.user.status !== 'ACTIVE') {
    return { message: 'Email or password is incorrect.' };
  }
  await prisma.user.update({ data: { lastActiveAt: new Date() }, where: { id: account.userId } });
  const token = await createSession(account.userId);
  await setSessionCookie(token);
  redirect(account.user.role === 'ADMIN' ? '/admin' : account.user.role === 'SELLER' ? '/seller' : '/account');
};

export const signOutAction = async (): Promise<void> => {
  const session = await getCurrentSession();
  if (session) {
    await prisma.session.deleteMany({ where: { token: session.token } });
  }
  await clearSessionCookie();
  redirect('/sign-in');
};
