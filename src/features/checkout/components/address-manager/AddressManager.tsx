'use client';

import { useState } from 'react';
import { Check, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { deleteAddressAction, setDefaultAddressAction } from '../../actions';
import type { AddressSummary } from '../../models';
import { AddressForm } from '../address-form';
import styles from './AddressManager.module.scss';
import type { AddressManagerProps } from './AddressManager.model';

export function AddressManager({
  addresses,
  selectable = false,
  selectedAddressId,
  onSelect,
}: AddressManagerProps) {
  const [editingAddress, setEditingAddress] = useState<AddressSummary | null>(null);
  const [isAdding, setIsAdding] = useState(addresses.length === 0);
  const [status, setStatus] = useState('');

  const runAction = async (action: () => Promise<{ status: string; message: string }>) => {
    const result = await action();
    setStatus(result.message);
  };

  const removeAddress = async (address: AddressSummary): Promise<void> => {
    if (!window.confirm(`Delete the address for ${address.fullName}?`)) return;
    await runAction(() => deleteAddressAction(address.id));
  };

  return (
    <div className={styles.root}>
      {addresses.length ? (
        <div className={styles.list}>
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address.id;
            return (
              <article className={styles.card} data-selected={isSelected} key={address.id}>
                {selectable ? (
                  <label className={styles.select}>
                    <input
                      type="radio"
                      name="delivery-address"
                      value={address.id}
                      checked={isSelected}
                      onChange={() => onSelect?.(address.id)}
                    />
                    <span>
                      <Check size={14} />
                    </span>
                  </label>
                ) : (
                  <MapPin size={19} aria-hidden="true" />
                )}
                <address>
                  <strong>{address.fullName}</strong>
                  <span>
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}
                  </span>
                  <span>
                    {address.city}, {address.state} {address.postalCode}
                  </span>
                  <span>{address.phone}</span>
                </address>
                <div className={styles.cardActions}>
                  {address.isDefault ? (
                    <small>Default</small>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void runAction(() => setDefaultAddressAction(address.id))}
                    >
                      Make default
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`Edit address for ${address.fullName}`}
                    onClick={() => setEditingAddress(address)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete address for ${address.fullName}`}
                    onClick={() => void removeAddress(address)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
      {editingAddress ? (
        <section className={styles.editor} aria-label="Edit delivery address">
          <h3>Edit address</h3>
          <AddressForm
            address={editingAddress}
            onSaved={() => setEditingAddress(null)}
            onCancel={() => setEditingAddress(null)}
          />
        </section>
      ) : null}
      {isAdding ? (
        <section className={styles.editor} aria-label="Add delivery address">
          <h3>Add a delivery address</h3>
          <AddressForm
            onSaved={(addressId) => {
              setIsAdding(false);
              onSelect?.(addressId);
            }}
            onCancel={addresses.length ? () => setIsAdding(false) : undefined}
          />
        </section>
      ) : (
        <Button variant="outline" leftIcon={<Plus size={16} />} onClick={() => setIsAdding(true)}>
          Add another address
        </Button>
      )}
      <p className={styles.status} role="status">
        {status}
      </p>
    </div>
  );
}
