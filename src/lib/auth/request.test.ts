import { getTrustedClientIp } from './request';

describe('trusted client address resolution', () => {
  it('ignores forwarding headers when no proxy is trusted', () => {
    expect(getTrustedClientIp('203.0.113.10', 0)).toBeUndefined();
  });

  it('selects an address relative to the trusted end of the proxy chain', () => {
    expect(getTrustedClientIp('attacker-value, 203.0.113.10', 1)).toBe('203.0.113.10');
    expect(getTrustedClientIp('203.0.113.10, 198.51.100.2', 2)).toBe('203.0.113.10');
  });

  it('rejects malformed or incomplete proxy chains', () => {
    expect(getTrustedClientIp('not-an-ip', 1)).toBeUndefined();
    expect(getTrustedClientIp('203.0.113.10', 2)).toBeUndefined();
  });
});
