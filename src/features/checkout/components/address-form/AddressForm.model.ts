import type { AddressSummary } from '../../models';

export interface AddressFormProps {
  readonly address?: AddressSummary | undefined;
  readonly onSaved?: (addressId: string) => void;
  readonly onCancel?: (() => void) | undefined;
}
