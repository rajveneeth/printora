import type { SellerMetric } from '../../models';
import styles from './MetricCard.module.scss';

export function MetricCard({ label, value, detail, tone }: SellerMetric) {
  return (
    <article className={styles.card} data-tone={tone}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}
