'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Textarea } from '@/components/ui';
import { submitSellerApplicationAction, updateSellerProfileAction } from '../../actions';
import { sellerProfileSchema, type SellerProfileInput } from '../../schemas';
import styles from './SellerProfileForm.module.scss';

interface SellerProfileFormProps {
  readonly defaultValues: SellerProfileInput;
  readonly mode: 'onboarding' | 'profile';
}

export function SellerProfileForm({ defaultValues, mode }: SellerProfileFormProps) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SellerProfileInput>({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues,
  });
  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result =
        mode === 'onboarding'
          ? await submitSellerApplicationAction(values)
          : await updateSellerProfileAction(values);
      setMessage(result.message);
    });
  });
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <section className={styles.section} aria-labelledby="store-details-heading">
        <div className={styles.sectionHeading}>
          <p>Store identity</p>
          <h2 id="store-details-heading">Tell buyers who you are</h2>
        </div>
        <div className={styles.grid}>
          <Input
            label="Store name"
            error={errors.storeName?.message}
            autoComplete="organization"
            {...register('storeName')}
          />
          <Input
            label="Store URL slug"
            hint="Lowercase letters, numbers, and hyphens only."
            error={errors.storeSlug?.message}
            {...register('storeSlug')}
          />
        </div>
        <Textarea
          label="Store description"
          hint="Describe your specialties, process, and finish quality."
          error={errors.description?.message}
          {...register('description')}
        />
        <div className={styles.grid}>
          <Input
            label="Store logo path"
            hint="Use a safe local /catalogue/ image path for development."
            error={errors.logoUrl?.message}
            {...register('logoUrl')}
          />
          <Input
            label="Store banner path"
            hint="Use a wide local /catalogue/ image for development."
            error={errors.bannerUrl?.message}
            {...register('bannerUrl')}
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="contact-heading">
        <div className={styles.sectionHeading}>
          <p>Contact and origin</p>
          <h2 id="contact-heading">Business contact details</h2>
        </div>
        <div className={styles.grid}>
          <Input
            label="Contact email"
            type="email"
            error={errors.contactEmail?.message}
            autoComplete="email"
            {...register('contactEmail')}
          />
          <Input
            label="Contact phone"
            type="tel"
            error={errors.contactPhone?.message}
            autoComplete="tel"
            {...register('contactPhone')}
          />
          <Input
            label="Shipping origin city"
            error={errors.originCity?.message}
            autoComplete="address-level2"
            {...register('originCity')}
          />
          <Input
            label="Shipping origin state"
            error={errors.originState?.message}
            autoComplete="address-level1"
            {...register('originState')}
          />
          <Input
            label="Shipping origin postal code"
            inputMode="numeric"
            error={errors.originPostalCode?.message}
            autoComplete="postal-code"
            {...register('originPostalCode')}
          />
          <Input
            label="Years of printing experience"
            type="number"
            min={0}
            max={80}
            error={errors.yearsExperience?.message}
            {...register('yearsExperience', { valueAsNumber: true })}
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="capabilities-heading">
        <div className={styles.sectionHeading}>
          <p>Capabilities</p>
          <h2 id="capabilities-heading">What can your workshop produce?</h2>
        </div>
        <div className={styles.grid}>
          <Input
            label="Supported materials"
            hint="Comma-separated, for example PLA, PETG, ABS."
            error={errors.supportedMaterials?.message}
            {...register('supportedMaterials')}
          />
          <Input
            label="Print technologies"
            hint="Comma-separated, for example FDM, SLA."
            error={errors.printTechnologies?.message}
            {...register('printTechnologies')}
          />
          <Input
            label="Maximum print dimensions"
            hint="For example 220 × 220 × 250 mm."
            error={errors.maxPrintDimensions?.message}
            {...register('maxPrintDimensions')}
          />
          <Input
            label="Average processing time in days"
            type="number"
            min={1}
            max={90}
            error={errors.averageProcessDays?.message}
            {...register('averageProcessDays', { valueAsNumber: true })}
          />
        </div>
        <label className={styles.checkbox}>
          <input type="checkbox" {...register('customOrdersEnabled')} />I am available for
          custom-order requests.
        </label>
      </section>

      <section className={styles.declaration} aria-labelledby="declaration-heading">
        <h2 id="declaration-heading">Seller declaration</h2>
        <p>
          I will list only products I am permitted to sell and will not offer weapons, dangerous
          devices, counterfeit goods, or unsupported medical claims.
        </p>
        <label className={styles.checkbox}>
          <input type="checkbox" {...register('declarationAccepted')} />I confirm the information
          above is accurate.
        </label>
        {errors.declarationAccepted?.message ? (
          <p className={styles.error}>{errors.declarationAccepted.message}</p>
        ) : null}
      </section>

      <div className={styles.actions}>
        <Button type="submit" isLoading={isPending}>
          {mode === 'onboarding' ? 'Submit seller application' : 'Save store profile'}
        </Button>
        <p aria-live="polite">{message}</p>
      </div>
    </form>
  );
}
