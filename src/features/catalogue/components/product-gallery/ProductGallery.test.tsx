import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { products } from '@/features/catalogue/data';
import { ProductGallery } from './ProductGallery';

describe('ProductGallery', () => {
  const product = products[0];

  it('opens an accessible viewer and closes it with Escape', async () => {
    if (!product) throw new Error('Product fixture is required');
    const user = userEvent.setup();
    render(<ProductGallery productName={product.name} images={product.gallery} />);

    await user.click(screen.getByRole('button', { name: 'Open full-screen image' }));
    expect(
      screen.getByRole('dialog', { name: `${product.name} full-screen image viewer` }),
    ).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports thumbnail selection with an announced current state', async () => {
    if (!product) throw new Error('Product fixture is required');
    const user = userEvent.setup();
    render(<ProductGallery productName={product.name} images={product.gallery} />);
    const secondThumbnail = screen.getByRole('button', { name: 'Show image 2 of 3' });

    await user.click(secondThumbnail);

    expect(secondThumbnail).toHaveAttribute('aria-current', 'true');
  });
});
