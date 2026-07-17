import { NextResponse, type NextRequest } from 'next/server';
import { sessionCookieName } from '@/lib/auth/constants';

const protectedPrefixes = ['/account', '/seller', '/admin'];

export function middleware(request: NextRequest) {
  const needsSession = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );
  const hasSession = Boolean(request.cookies.get(sessionCookieName)?.value);
  if (needsSession && !hasSession) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/account/:path*', '/seller/:path*', '/admin/:path*'] };
