import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('associates label, hint, and error text', () => {
    render(<Input label="Store name" hint="Use your public maker name" error="Store name is required" />);
    const input = screen.getByLabelText('Store name');
    expect(input).toHaveAccessibleDescription('Use your public maker name Store name is required');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
