import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('announces loading content', () => {
    render(<Skeleton label="Loading products" />);
    expect(screen.getByRole('status', { name: 'Loading products' })).toBeInTheDocument();
  });
});
