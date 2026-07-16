import { clsx, type ClassValue } from 'clsx';

export const cn = (...values: ReadonlyArray<ClassValue>): string => clsx(values);
