import { render, screen } from '@testing-library/react';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('renders an alert', () => {
    render(<ErrorState title="Upload failed" description="Try a smaller image." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Try a smaller image.');
  });
});
