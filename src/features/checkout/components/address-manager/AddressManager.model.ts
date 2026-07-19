import type { AddressSummary } from '../../models';

export interface AddressManagerProps {
  readonly addresses: readonly AddressSummary[];
  readonly selectable?: boolean;
  readonly selectedAddressId?: string | undefined;
  readonly onSelect?: ((addressId: string) => void) | undefined;
}
