'use client';

import { useActionState } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { saveCategoryAction } from '../../actions';
import type { AdminCategoryRecord } from '../../models';
import styles from './CategoryForm.module.scss';

interface CategoryFormProps {
  readonly category?: AdminCategoryRecord | undefined;
  readonly categories: readonly AdminCategoryRecord[];
}

const initialState = { status: 'idle', message: '' } as const;

export function CategoryForm({ category, categories }: CategoryFormProps) {
  const [state, action, isPending] = useActionState(saveCategoryAction, initialState);
  const parentOptions = [
    { value: '', label: 'No parent' },
    ...categories
      .filter((candidate) => candidate.id !== category?.id)
      .map((candidate) => ({ value: candidate.id, label: candidate.name })),
  ];
  return (
    <form action={action} className={styles.form}>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className={styles.columns}>
        <Input label="Name" name="name" defaultValue={category?.name} required />
        <Input label="Slug" name="slug" defaultValue={category?.slug} required />
      </div>
      <Textarea label="Description" name="description" defaultValue={category?.description ?? ''} />
      <div className={styles.columns}>
        <Select
          label="Parent category"
          name="parentId"
          options={parentOptions}
          defaultValue={category?.parentId ?? ''}
        />
        <Input
          label="Display order"
          name="position"
          type="number"
          min={0}
          defaultValue={category?.position ?? 0}
          required
        />
      </div>
      <div className={styles.columns}>
        <Input label="Image URL" name="imageUrl" defaultValue={category?.imageUrl ?? ''} />
        <Input label="Icon name" name="icon" defaultValue={category?.icon ?? ''} />
      </div>
      <div className={styles.columns}>
        <Input label="SEO title" name="seoTitle" defaultValue={category?.seoTitle ?? ''} />
        <Input
          label="SEO description"
          name="seoDescription"
          defaultValue={category?.seoDescription ?? ''}
        />
      </div>
      <label className={styles.checkbox}>
        <input type="checkbox" name="isActive" defaultChecked={category?.isActive ?? true} />
        Active in marketplace navigation
      </label>
      <Button type="submit" isLoading={isPending}>
        {category ? 'Save category' : 'Add category'}
      </Button>
      {state.message ? (
        <p className={state.status === 'error' ? styles.error : styles.success} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
