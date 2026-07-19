import { render, screen } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('associates its label and hint with the control', () => {
    render(<Textarea label="Description" hint="Describe the product clearly." />);
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveAccessibleDescription(
      'Describe the product clearly.',
    );
  });

  it('exposes an accessible invalid state', () => {
    render(<Textarea label="Description" error="Description is required." />);
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Description is required.')).toBeInTheDocument();
  });
});
