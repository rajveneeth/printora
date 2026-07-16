import type { ReactNode } from 'react';

export interface ErrorStateProps { readonly title: string; readonly description: string; readonly action?: ReactNode; }
