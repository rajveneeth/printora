import { isIP } from 'node:net';
import { headers } from 'next/headers';
import { environment } from '@/lib/validation/env';

export interface RequestMetadata {
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export const getTrustedClientIp = (
  forwardedFor: string | null,
  trustedProxyHops: number,
): string | undefined => {
  if (trustedProxyHops === 0 || !forwardedFor) return undefined;

  const chain = forwardedFor.split(',').map((value) => value.trim());
  const clientIndex = chain.length - trustedProxyHops;
  if (clientIndex < 0) return undefined;

  const clientAddress = chain[clientIndex];
  return clientAddress && isIP(clientAddress) ? clientAddress : undefined;
};

export const getRequestMetadata = async (): Promise<RequestMetadata> => {
  const requestHeaders = await headers();
  const ipAddress = getTrustedClientIp(
    requestHeaders.get('x-forwarded-for'),
    environment.TRUSTED_PROXY_HOPS,
  );
  const userAgent = requestHeaders.get('user-agent')?.trim().slice(0, 512) || undefined;
  return {
    ...(ipAddress ? { ipAddress } : {}),
    ...(userAgent ? { userAgent } : {}),
  };
};
