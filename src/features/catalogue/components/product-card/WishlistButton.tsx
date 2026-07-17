'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import styles from './ProductCard.module.scss';

export interface WishlistButtonProps {
  readonly productName: string;
}

export function WishlistButton({ productName }: WishlistButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const label = isSaved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`;

  return (
    <>
      <button
        className={styles.wishlist}
        type="button"
        aria-label={label}
        aria-pressed={isSaved}
        onClick={() => setIsSaved((current) => !current)}
      >
        <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
      <span className="sr-only" aria-live="polite">
        {isSaved ? `${productName} saved` : ''}
      </span>
    </>
  );
}
