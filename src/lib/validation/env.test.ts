import { environment } from '@/lib/validation/env';

describe('environment validation', () => {
  it('provides a valid local application URL by default', () => {
    expect(environment.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
  });
});
