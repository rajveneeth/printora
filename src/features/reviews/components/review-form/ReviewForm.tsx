'use client';

import { useActionState } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { submitRatingAction } from '../../actions';
import styles from './ReviewForm.module.scss';

interface ReviewFormProps {
  readonly orderItemId: string;
  readonly productName: string;
}

const initialState = { status: 'idle', message: '' } as const;
const ratingOptions = [5, 4, 3, 2, 1].map((rating) => ({
  value: String(rating),
  label: `${rating} star${rating === 1 ? '' : 's'}`,
}));

export function ReviewForm({ orderItemId, productName }: ReviewFormProps) {
  const [state, action, isPending] = useActionState(submitRatingAction, initialState);
  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="orderItemId" value={orderItemId} />
      <div>
        <p>Verified purchase review</p>
        <h3>Rate {productName}</h3>
      </div>
      <fieldset>
        <legend>Product ratings</legend>
        <div className={styles.ratings}>
          <Select label="Quality" name="qualityRating" options={ratingOptions} />
          <Select label="Finish" name="finishRating" options={ratingOptions} />
          <Select label="Accuracy" name="accuracyRating" options={ratingOptions} />
          <Select label="Value" name="valueRating" options={ratingOptions} />
        </div>
      </fieldset>
      <fieldset>
        <legend>Seller ratings</legend>
        <div className={styles.ratings}>
          <Select label="Communication" name="communicationRating" options={ratingOptions} />
          <Select label="Dispatch speed" name="dispatchSpeedRating" options={ratingOptions} />
          <Select
            label="Customisation experience"
            name="customisationRating"
            options={ratingOptions}
          />
        </div>
      </fieldset>
      <Input label="Review title" name="title" maxLength={100} required />
      <Textarea label="Your review" name="body" minLength={20} maxLength={1000} required />
      <Button type="submit" isLoading={isPending}>
        Submit verified review
      </Button>
      {state.message ? (
        <p className={state.status === 'error' ? styles.error : styles.success} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
