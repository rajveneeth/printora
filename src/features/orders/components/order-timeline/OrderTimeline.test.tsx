import { render, screen } from '@testing-library/react';
import { OrderTimeline } from './OrderTimeline';

describe('OrderTimeline', () => {
  it('renders semantic status history with notes and timestamps', () => {
    render(
      <OrderTimeline
        events={[
          {
            id: 'event-1',
            status: 'CONFIRMED',
            previousStatus: 'PAID',
            note: 'Seller confirmed the order.',
            sellerId: 'seller-1',
            createdAt: new Date('2026-07-19T10:00:00.000Z'),
          },
        ]}
      />,
    );
    expect(screen.getByRole('list', { name: /order status history/i })).toBeInTheDocument();
    expect(screen.getByText('confirmed')).toBeInTheDocument();
    expect(screen.getByText(/seller confirmed/i)).toBeInTheDocument();
    expect(
      screen
        .getByText(/seller confirmed/i)
        .closest('li')
        ?.querySelector('time'),
    ).toHaveAttribute('datetime', '2026-07-19T10:00:00.000Z');
  });
});
