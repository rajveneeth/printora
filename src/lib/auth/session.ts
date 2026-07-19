import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/models/user.model';
import { prisma } from '@/lib/prisma';
import { canAccessRole } from './roles';
import { authenticatedCookieName, sessionCookieName, sessionDurationInDays } from './constants';
import type { RequestMetadata } from './request';

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

export interface AuthSession {
  id: string;
  expiresAt: Date;
  user: AuthSessionUser;
}

export const hashSessionToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const createSession = async (
  userId: string,
  metadata: RequestMetadata = {},
): Promise<string> => {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + sessionDurationInDays * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: {
      token: hashSessionToken(token),
      userId,
      expiresAt,
      ipAddress: metadata.ipAddress ?? null,
      userAgent: metadata.userAgent ?? null,
    },
  });
  return token;
};

export const setSessionCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: sessionDurationInDays * 24 * 60 * 60,
  });
  cookieStore.set(authenticatedCookieName, '1', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: sessionDurationInDays * 24 * 60 * 60,
  });
};

export const clearSessionCookie = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
  cookieStore.delete(authenticatedCookieName);
};

export const getCurrentSession = async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) {
    return null;
  }
  const tokenHash = hashSessionToken(token);
  const session = await prisma.session.findUnique({
    include: { user: true },
    where: { token: tokenHash },
  });
  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    return null;
  }
  if (session.user.status !== 'ACTIVE') {
    await prisma.session.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return null;
  }
  return {
    id: session.id,
    expiresAt: session.expiresAt,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      status: session.user.status,
    },
  };
};

export const requireSession = async (returnTo = ''): Promise<AuthSession> => {
  const session = await getCurrentSession();
  if (!session) {
    redirect(returnTo ? `/sign-in?next=${encodeURIComponent(returnTo)}` : '/sign-in');
  }
  return session;
};

export const requireRole = async (role: UserRole): Promise<AuthSession> => {
  const session = await requireSession();
  if (!canAccessRole(session.user.role, role)) {
    redirect('/unauthorised');
  }
  return session;
};
