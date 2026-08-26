import type { HTMLAttributes } from 'react';
import { cx } from './cx';

type Size = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: Size;
  label?: string;
}

export default function Spinner({
  size = 'md',
  label,
  className,
  ...rest
}: SpinnerProps) {
  return (
    <span
      className={cx('spinner', `spinner--${size}`, className)}
      role="status"
      aria-label={label ?? 'Loading'}
      {...rest}
    />
  );
}
