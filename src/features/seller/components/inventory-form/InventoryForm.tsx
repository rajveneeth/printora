'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button, Input } from '@/components/ui';
import { updateSellerInventoryAction } from '../../actions';
import { inventoryUpdateSchema, type InventoryUpdateInput } from '../../schemas';
import styles from './InventoryForm.module.scss';

interface InventoryFormProps {
  readonly defaultValues: InventoryUpdateInput;
  readonly productReserved: number;
  readonly variants: readonly {
    id: string;
    name: string;
    sku: string;
    reserved: number;
  }[];
}

export function InventoryForm({ defaultValues, productReserved, variants }: InventoryFormProps) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryUpdateInput>({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues,
  });
  const variantFields = useFieldArray({ control, name: 'variants' });
  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateSellerInventoryAction(values);
      setMessage(result.message);
    });
  });
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <input type="hidden" {...register('productId')} />
      <section className={styles.section} aria-labelledby="base-inventory-heading">
        <div>
          <p>Base inventory</p>
          <h2 id="base-inventory-heading">Product-level stock</h2>
          <span>{productReserved} units are currently reserved and cannot be removed.</span>
        </div>
        <div className={styles.grid}>
          <Input
            label="Quantity on hand"
            type="number"
            min={productReserved}
            error={errors.productQuantity?.message}
            {...register('productQuantity', { valueAsNumber: true })}
          />
          <Input
            label="Low-stock threshold"
            type="number"
            min={0}
            error={errors.productLowStockThreshold?.message}
            {...register('productLowStockThreshold', { valueAsNumber: true })}
          />
        </div>
      </section>
      {variantFields.fields.length > 0 ? (
        <section className={styles.section} aria-labelledby="variant-inventory-heading">
          <div>
            <p>Variant inventory</p>
            <h2 id="variant-inventory-heading">Stock by SKU</h2>
            <span>Reserved quantities remain protected by server-side validation.</span>
          </div>
          <div className={styles.variantList}>
            {variantFields.fields.map((field, index) => {
              const variant = variants.find((entry) => entry.id === field.variantId);
              const reserved = variant?.reserved ?? 0;
              return (
                <fieldset key={field.id}>
                  <legend>
                    {variant?.name ?? 'Variant'} <span>{variant?.sku}</span>
                  </legend>
                  <input type="hidden" {...register(`variants.${index}.variantId`)} />
                  <div className={styles.grid}>
                    <Input
                      label="Quantity on hand"
                      type="number"
                      min={reserved}
                      hint={`${reserved} reserved`}
                      error={errors.variants?.[index]?.quantity?.message}
                      {...register(`variants.${index}.quantity`, { valueAsNumber: true })}
                    />
                    <Input
                      label="Low-stock threshold"
                      type="number"
                      min={0}
                      error={errors.variants?.[index]?.lowStockThreshold?.message}
                      {...register(`variants.${index}.lowStockThreshold`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </fieldset>
              );
            })}
          </div>
        </section>
      ) : null}
      <div className={styles.actions}>
        <Button type="submit" isLoading={isPending}>
          Update inventory
        </Button>
        <p aria-live="polite">{message}</p>
      </div>
    </form>
  );
}
