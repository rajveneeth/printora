import { headers } from 'next/headers';

export interface RequestMetadata {
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

const firstForwardedValue = (value: string | null): string | undefined => {
  const first = value?.split(',')[0]?.trim();
  return first ? first.slice(0, 128) : undefined;
};

export const getRequestMetadata = async (): Promise<RequestMetadata> => {
  const requestHeaders = await headers();
  const ipAddress =
    firstForwardedValue(requestHeaders.get('x-forwarded-for')) ??
    firstForwardedValue(requestHeaders.get('x-real-ip'));
  const userAgent = requestHeaders.get('user-agent')?.trim().slice(0, 512) || undefined;
  return {
    ...(ipAddress ? { ipAddress } : {}),
    ...(userAgent ? { userAgent } : {}),
  };
};
