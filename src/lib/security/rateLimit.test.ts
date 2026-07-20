import { createRateLimitKey } from './rateLimit';

describe('rate-limit identifiers', () => {
  it('are deterministic within a window without storing the raw identity', () => {
    const key = createRateLimitKey('sign-in', 'Alice@Example.com', 1_000, 's'.repeat(32));
    expect(key).toHaveLength(64);
    expect(key).toBe(createRateLimitKey('sign-in', ' alice@example.COM ', 1_000, 's'.repeat(32)));
    expect(key).not.toContain('alice@example.com');
    expect(key).not.toBe(createRateLimitKey('sign-in', 'alice@example.com', 2_000, 's'.repeat(32)));
  });
});
