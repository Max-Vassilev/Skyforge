import type { HTMLAttributes } from 'react';
import { cx } from './cx';

type Variant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export default function Alert({
  variant = 'info',
  className,
  children,
  ...rest
}: AlertProps) {
  return (
    <div
      className={cx('alert', `alert--${variant}`, className)}
      role="alert"
      {...rest}
    >
      {children}
    </div>
  );
}
