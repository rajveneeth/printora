import { NextResponse, type NextRequest } from 'next/server';
import { sessionCookieName } from '@/lib/auth/constants';

const protectedPrefixes = ['/account', '/seller', '/admin', '/checkout'];

export function proxy(request: NextRequest) {
  const needsSession = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );
  const hasSession = Boolean(request.cookies.get(sessionCookieName)?.value);
  if (needsSession && !hasSession) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/seller/:path*', '/admin/:path*', '/checkout/:path*'],
};
