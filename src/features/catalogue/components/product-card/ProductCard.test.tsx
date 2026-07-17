import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { products } from '@/features/catalogue/data';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const product = products[0];

  it('renders stable catalogue information and an accessible product link', () => {
    if (!product) throw new Error('Product fixture is required');
    render(<ProductCard product={product} />);

    expect(screen.getByRole('heading', { name: product.name })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: product.name })).toHaveAttribute(
      'href',
      `/products/${product.slug}`,
    );
    expect(screen.getByLabelText(/out of 5 product rating/i)).toBeInTheDocument();
    expect(screen.getByText('Customisable')).toBeInTheDocument();
  });

  it('toggles wishlist state independently from product navigation', async () => {
    if (!product) throw new Error('Product fixture is required');
    const user = userEvent.setup();
    render(<ProductCard product={product} />);
    const wishlistButton = screen.getByRole('button', { name: `Save ${product.name} to wishlist` });

    await user.click(wishlistButton);

    expect(
      screen.getByRole('button', { name: `Remove ${product.name} from wishlist` }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(`${product.name} saved`)).toBeInTheDocument();
  });
});
