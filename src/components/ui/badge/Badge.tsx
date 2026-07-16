import { cn } from '@/lib/utils';
import styles from './Badge.module.scss';
import type { BadgeProps } from './Badge.model';

export function Badge({ tone = 'neutral', children, className, ...props }: BadgeProps) {
  return <span className={cn(styles.root, styles[tone], className)} {...props}>{children}</span>;
}
