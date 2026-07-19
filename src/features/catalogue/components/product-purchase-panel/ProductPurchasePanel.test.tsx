import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { products } from '@/features/catalogue/data';
import { useCartStore } from '@/features/cart';
import { ProductPurchasePanel } from './ProductPurchasePanel';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe('ProductPurchasePanel', () => {
  const product = products[0];

  beforeEach(() => {
    useCartStore.setState({ items: [], isHydrated: true });
  });

  it('supports variant selection and quantity changes', async () => {
    if (!product) throw new Error('Product fixture is required');
    const user = userEvent.setup();
    render(<ProductPurchasePanel product={product} />);
    const secondVariant = product.variants[1];
    if (!secondVariant) throw new Error('A second variant fixture is required');

    await user.click(screen.getByRole('radio', { name: new RegExp(secondVariant.colour, 'i') }));
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    await user.click(screen.getByRole('button', { name: 'Add to bag' }));

    expect(
      screen.getByRole('radio', { name: new RegExp(secondVariant.colour, 'i') }),
    ).toBeChecked();
    expect(screen.getByLabelText('Quantity')).toHaveTextContent('2');
    expect(
      screen.getByText(new RegExp(`2 × ${product.name}, ${secondVariant.name}`, 'i')),
    ).toBeInTheDocument();
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
  });

  it('prevents quantity from decreasing below one', async () => {
    if (!product) throw new Error('Product fixture is required');
    const user = userEvent.setup();
    render(<ProductPurchasePanel product={product} />);
    const decrease = screen.getByRole('button', { name: 'Decrease quantity' });

    expect(decrease).toBeDisabled();
    await user.click(decrease);
    expect(screen.getByLabelText('Quantity')).toHaveTextContent('1');
  });
});
