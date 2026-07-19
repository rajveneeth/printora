import { calculateDiscountPercentage, formatPrice } from '@/features/catalogue/services';
import styles from './PriceDisplay.module.scss';
import type { PriceDisplayProps } from './PriceDisplay.model';

export function PriceDisplay({
  priceInPaise,
  compareAtPriceInPaise,
  size = 'medium',
  taxNote = false,
}: PriceDisplayProps) {
  const discount = calculateDiscountPercentage(priceInPaise, compareAtPriceInPaise);
  return (
    <div className={styles.root} data-size={size}>
      <div className={styles.prices}>
        <span className={styles.current}>{formatPrice(priceInPaise)}</span>
        {compareAtPriceInPaise ? (
          <span
            className={styles.compare}
            aria-label={`Original price ${formatPrice(compareAtPriceInPaise)}`}
          >
            {formatPrice(compareAtPriceInPaise)}
          </span>
        ) : null}
        {discount ? <span className={styles.discount}>{discount}% off</span> : null}
      </div>
      {taxNote ? <p>Applicable tax is calculated at checkout</p> : null}
    </div>
  );
}
