import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export default function IconButton({
  label,
  className,
  children,
  type,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={cx('icon-btn', className)}
      aria-label={label}
      {...rest}
    >
      {children}
    </button>
  );
}
