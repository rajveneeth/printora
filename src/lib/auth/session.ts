import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/models/user.model';
import { prisma } from '@/lib/prisma';
import { canAccessRole } from './roles';
import { sessionCookieName } from './constants';

const sessionDays = 30;

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

export interface AuthSession {
  token: string;
  expiresAt: Date;
  user: AuthSessionUser;
}

export const createSession = async (userId: string): Promise<string> => {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  return token;
};

export const setSessionCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: sessionDays * 24 * 60 * 60,
  });
};

export const clearSessionCookie = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
};

export const getCurrentSession = async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) {
    return null;
  }
  const session = await prisma.session.findUnique({ include: { user: true }, where: { token } });
  if (!session || session.expiresAt <= new Date() || session.user.status !== 'ACTIVE') {
    await prisma.session.deleteMany({ where: { token } });
    return null;
  }
  return {
    token: session.token,
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

export const requireSession = async (): Promise<AuthSession> => {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/sign-in');
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
