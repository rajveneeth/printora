import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders as an article by default', () => {
    render(<Card>Product card</Card>);
    expect(screen.getByRole('article')).toHaveTextContent('Product card');
  });
});
