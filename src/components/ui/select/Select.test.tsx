import { render, screen } from '@testing-library/react';
import { Select } from './Select';

describe('Select', () => {
  it('renders the supplied options', () => {
    render(
      <Select
        label="Material"
        options={[{ label: 'PLA', value: 'pla' }]}
        placeholder="Choose material"
      />,
    );
    expect(screen.getByRole('combobox', { name: 'Material' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'PLA' })).toBeInTheDocument();
  });
});
