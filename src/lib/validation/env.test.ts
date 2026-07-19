import { environment } from '@/lib/validation/env';

describe('environment validation', () => {
  it('provides a valid local application URL by default', () => {
    expect(environment.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
  });

  it('keeps dashboard configuration in independently prefixed groups', () => {
    expect(environment.CUSTOMER_DASHBOARD_ENABLED).toBe(true);
    expect(environment.SELLER_DASHBOARD_ENABLED).toBe(true);
    expect(environment.ADMIN_DASHBOARD_ENABLED).toBe(true);
    expect(environment.SELLER_IMAGE_MAX_COUNT).toBe(8);
  });
});
