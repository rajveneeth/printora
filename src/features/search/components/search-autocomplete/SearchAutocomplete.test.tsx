import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchAutocomplete } from './SearchAutocomplete';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const suggestionResponse = {
  suggestions: [
    {
      id: 'product-phone-minimal',
      kind: 'product',
      label: 'Minimal Phone Stand',
      description: 'Phone & electronics · Fern Fabrication',
      href: '/products/minimal-phone-stand',
    },
    {
      id: 'popular-phone-stand',
      kind: 'popular',
      label: 'phone stand',
      description: 'Popular marketplace search',
      href: '/search?q=phone+stand',
    },
  ],
};

describe('SearchAutocomplete', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockPush.mockReset();
    window.localStorage.clear();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => suggestionResponse,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('debounces suggestions and supports Arrow Down, Enter, and Escape', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchAutocomplete id="test-search" />);
    const input = screen.getByRole('combobox', { name: /search products/i });

    await user.type(input, 'phone');
    await act(async () => jest.advanceTimersByTime(260));

    expect(await screen.findByRole('option', { name: /minimal phone stand/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('2 search suggestions available');

    await user.keyboard('{ArrowDown}{Enter}');
    expect(mockPush).toHaveBeenCalledWith('/products/minimal-phone-stand');
    expect(input).toHaveAttribute('aria-expanded', 'false');

    await user.click(input);
    await user.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('submits a category-aware search and remembers it', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchAutocomplete id="category-search" category="phone-electronics-accessories" />);

    await user.type(screen.getByRole('combobox'), 'phone stand{Enter}');

    expect(mockPush).toHaveBeenCalledWith(
      '/search?q=phone+stand&category=phone-electronics-accessories',
    );
    expect(window.localStorage.getItem('formivo-recent-searches')).toContain('phone stand');
  });
});
