'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui';
import type { ProductStatus } from '@/models/product.model';
import { runSellerProductAction } from '../../actions';
import type { SellerProductLifecycleAction } from '../../services';
import styles from './ProductActions.module.scss';

interface ProductActionsProps {
  readonly productId: string;
  readonly productSlug: string;
  readonly status: ProductStatus;
}

export function ProductActions({ productId, productSlug, status }: ProductActionsProps) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const runAction = (action: SellerProductLifecycleAction) => {
    if (action === 'ARCHIVE' && !window.confirm('Archive this product? It will remain private.')) {
      return;
    }
    startTransition(async () => {
      const result = await runSellerProductAction(productId, action);
      setMessage(result.message);
    });
  };
  const canEdit = !['PENDING_REVIEW', 'ARCHIVED'].includes(status);
  const canSubmit = ['DRAFT', 'CHANGES_REQUESTED', 'REJECTED'].includes(status);
  const canPublish = status === 'APPROVED' || status === 'PAUSED';
  return (
    <div className={styles.root}>
      <div className={styles.links}>
        {status === 'PUBLISHED' ? <Link href={`/products/${productSlug}`}>View</Link> : null}
        {canEdit ? <Link href={`/seller/products/${productId}/edit`}>Edit</Link> : null}
        {status !== 'ARCHIVED' ? (
          <Link href={`/seller/products/${productId}/inventory`}>Inventory</Link>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => runAction('DUPLICATE')}
        >
          Duplicate
        </Button>
        {canSubmit ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => runAction('SUBMIT_REVIEW')}
          >
            Submit for review
          </Button>
        ) : null}
        {canPublish ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => runAction('PUBLISH')}
          >
            Publish
          </Button>
        ) : null}
        {status === 'PUBLISHED' ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => runAction('PAUSE')}
          >
            Pause
          </Button>
        ) : null}
        {status !== 'ARCHIVED' ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => runAction('ARCHIVE')}
          >
            Archive
          </Button>
        ) : null}
      </div>
      <p aria-live="polite">{message}</p>
    </div>
  );
}
