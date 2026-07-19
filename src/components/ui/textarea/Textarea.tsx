import { useId } from 'react';
import type { TextareaProps } from './Textarea.model';
import styles from './Textarea.module.scss';

export function Textarea({ label, error, hint, id, className, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        className={className ? `${styles.control} ${className}` : styles.control}
        id={textareaId}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
