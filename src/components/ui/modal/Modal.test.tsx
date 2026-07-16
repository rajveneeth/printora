import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('closes when the close button is pressed', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(<Modal isOpen title="Custom request" onClose={handleClose}>Share details</Modal>);
    await user.click(screen.getByRole('button', { name: /close modal/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
