import { render, screen } from '@testing-library/react';
import { ReviewForm } from './ReviewForm';

jest.mock('../../actions', () => ({
  submitRatingAction: jest.fn(),
}));

describe('ReviewForm', () => {
  it('labels separate product and seller rating controls', () => {
    render(<ReviewForm orderItemId="item-1" productName="Minimal Phone Stand" />);
    expect(screen.getByRole('heading', { name: /rate minimal phone stand/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /product ratings/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /seller ratings/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Quality')).toBeInTheDocument();
    expect(screen.getByLabelText('Communication')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit verified review/i })).toBeInTheDocument();
  });
});
