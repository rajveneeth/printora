'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button, Input, Select } from '@/components/ui';
import { createAddressAction, updateAddressAction } from '../../actions';
import { addressSchema, type AddressInput } from '../../schemas';
import styles from './AddressForm.module.scss';
import type { AddressFormProps } from './AddressForm.model';

export function AddressForm({ address, onSaved, onCancel }: AddressFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          kind: address.kind,
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2 ?? '',
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: 'India',
          isDefault: address.isDefault,
        }
      : {
          kind: 'SHIPPING',
          country: 'India',
          isDefault: false,
          fullName: '',
          phone: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
        },
  });

  const submit = handleSubmit(async (values) => {
    setStatus('');
    const result = address
      ? await updateAddressAction(address.id, values)
      : await createAddressAction(values);
    setStatus(result.message);
    if (result.status === 'success') {
      router.refresh();
      const addressId = result.addressId ?? address?.id;
      if (addressId) onSaved?.(addressId);
    }
  });

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.grid}>
        <Input
          label="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Phone"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          className={styles.wide}
          label="Building and street"
          autoComplete="address-line1"
          error={errors.line1?.message}
          {...register('line1')}
        />
        <Input
          className={styles.wide}
          label="Apartment, floor or landmark (optional)"
          autoComplete="address-line2"
          error={errors.line2?.message}
          {...register('line2')}
        />
        <Input
          label="City"
          autoComplete="address-level2"
          error={errors.city?.message}
          {...register('city')}
        />
        <Input
          label="State"
          autoComplete="address-level1"
          error={errors.state?.message}
          {...register('state')}
        />
        <Input
          label="PIN code"
          inputMode="numeric"
          autoComplete="postal-code"
          error={errors.postalCode?.message}
          {...register('postalCode')}
        />
        <Select
          label="Address use"
          options={[
            { label: 'Delivery', value: 'SHIPPING' },
            { label: 'Billing', value: 'BILLING' },
            { label: 'Delivery and billing', value: 'BOTH' },
          ]}
          error={errors.kind?.message}
          {...register('kind')}
        />
      </div>
      <input type="hidden" value="India" {...register('country')} />
      <label className={styles.defaultChoice}>
        <input type="checkbox" {...register('isDefault')} /> Use as my default delivery address
      </label>
      <div className={styles.actions}>
        <Button type="submit" isLoading={isSubmitting}>
          {address ? 'Save changes' : 'Add address'}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
      <p className={styles.status} role="status">
        {status}
      </p>
    </form>
  );
}
