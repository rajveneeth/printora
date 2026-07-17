import { Star } from 'lucide-react';
import styles from './RatingSummary.module.scss';
import type { RatingSummaryProps } from './RatingSummary.model';

export function RatingSummary({
  rating,
  reviewCount,
  label = 'product rating',
  compact = false,
}: RatingSummaryProps) {
  return (
    <span
      className={styles.root}
      aria-label={`${rating.toFixed(1)} out of 5 ${label}, ${reviewCount} reviews`}
    >
      <Star size={compact ? 13 : 15} fill="currentColor" aria-hidden="true" />
      <b>{rating.toFixed(1)}</b>
      <span>({reviewCount})</span>
    </span>
  );
}
