import type { HTMLAttributes } from 'react';
import { cx } from './cx';

type Variant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export default function Badge({
  variant = 'neutral',
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cx('badge', `badge--${variant}`, className)} {...rest}>
      {children}
    </span>
  );
}
