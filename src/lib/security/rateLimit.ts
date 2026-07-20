import { createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { environment } from '@/lib/validation/env';

export interface RateLimitPolicy {
  readonly scope: string;
  readonly limit: number;
  readonly windowInMilliseconds: number;
}

export interface RateLimitResult {
  readonly remaining: number;
  readonly retryAfterInSeconds: number;
}

export class RateLimitExceededError extends Error {
  readonly retryAfterInSeconds: number;

  constructor(retryAfterInSeconds: number) {
    super('Too many attempts. Please wait before trying again.');
    this.name = 'RateLimitExceededError';
    this.retryAfterInSeconds = retryAfterInSeconds;
  }
}

export const createRateLimitKey = (
  scope: string,
  identifier: string,
  windowStart: number,
  secret: string,
): string =>
  createHash('sha256')
    .update(`${secret}:${scope}:${identifier.trim().toLowerCase()}:${windowStart}`)
    .digest('hex');

export const enforceRateLimit = async (
  identifier: string,
  policy: RateLimitPolicy,
  now = Date.now(),
): Promise<RateLimitResult> => {
  const windowStart = Math.floor(now / policy.windowInMilliseconds) * policy.windowInMilliseconds;
  const expiresAt = windowStart + policy.windowInMilliseconds;
  const bucket = await prisma.rateLimitBucket.upsert({
    where: {
      key: createRateLimitKey(policy.scope, identifier, windowStart, environment.RATE_LIMIT_SECRET),
    },
    update: { count: { increment: 1 } },
    create: {
      key: createRateLimitKey(policy.scope, identifier, windowStart, environment.RATE_LIMIT_SECRET),
      count: 1,
      windowStart: new Date(windowStart),
      expiresAt: new Date(expiresAt),
    },
  });
  const retryAfterInSeconds = Math.max(1, Math.ceil((expiresAt - now) / 1_000));
  if (bucket.count > policy.limit) throw new RateLimitExceededError(retryAfterInSeconds);
  return { remaining: Math.max(0, policy.limit - bucket.count), retryAfterInSeconds };
};
