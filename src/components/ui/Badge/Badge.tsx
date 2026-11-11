import type { ReactNode } from 'react';
import { classNames } from '@/lib/utils/class-names';
import styles from './Badge.module.css';

export type BadgeVariant = 'danger' | 'warning';

type BadgeProps = {
  variant: BadgeVariant;
  children: ReactNode;
};

export function Badge({ variant, children }: BadgeProps) {
  return <span className={classNames(styles.badge, styles[variant])}>{children}</span>;
}
