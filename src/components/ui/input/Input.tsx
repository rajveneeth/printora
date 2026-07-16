import { useId } from 'react';
import styles from './Input.module.scss';
import type { InputProps } from './Input.model';

export function Input({ label, error, hint, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>{label}</label>
      <input className={className ? `${styles.control} ${className}` : styles.control} id={inputId} aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined} aria-invalid={error ? true : undefined} {...props} />
      {hint ? <p className={styles.hint} id={descriptionId}>{hint}</p> : null}
      {error ? <p className={styles.error} id={errorId}>{error}</p> : null}
    </div>
  );
}
