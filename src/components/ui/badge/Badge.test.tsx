import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders status text', () => {
    render(<Badge tone="success">Approved</Badge>);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });
});
