import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  readonly label: string;
  readonly value: string;
}
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label: string;
  readonly options: ReadonlyArray<SelectOption>;
  readonly error?: string;
  readonly placeholder?: string;
}
