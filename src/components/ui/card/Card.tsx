import { cn } from '@/lib/utils';
import styles from './Card.module.scss';
import type { CardProps } from './Card.model';

export function Card({ as = 'article', children, className, ...props }: CardProps) {
  const Component = as;
  return <Component className={cn(styles.root, styles.padded, className)} {...props}>{children}</Component>;
}
