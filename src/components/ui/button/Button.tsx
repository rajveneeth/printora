import { cn } from '@/lib/utils';
import styles from './Button.module.scss';
import type { ButtonProps } from './Button.model';

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(styles.root, styles[variant], styles[size], className)}
      disabled={disabled || isLoading}
      type={type}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {leftIcon}
      <span>{isLoading ? 'Loading…' : children}</span>
      {rightIcon}
    </button>
  );
}
