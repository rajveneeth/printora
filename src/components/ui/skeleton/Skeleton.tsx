import { cn } from '@/lib/utils';
import styles from './Skeleton.module.scss';
import type { SkeletonProps } from './Skeleton.model';

export function Skeleton({ label = 'Loading content', className, ...props }: SkeletonProps) {
  return <div className={cn(styles.root, className)} role="status" aria-label={label} {...props} />;
}
