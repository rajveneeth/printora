import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders recovery content', () => {
    render(<EmptyState title="No products yet" description="Add your first 3D print listing." />);
    expect(screen.getByRole('heading', { name: 'No products yet' })).toBeInTheDocument();
  });
});
