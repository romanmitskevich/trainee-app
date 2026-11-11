import type { ButtonHTMLAttributes } from 'react';
import { classNames } from '@/lib/utils/class-names';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'link';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = 'secondary', type = 'button', className, ...buttonProps }: ButtonProps) {
  return <button type={type} className={classNames(styles.button, styles[variant], className)} {...buttonProps} />;
}
