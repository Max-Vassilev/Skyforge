import type { HTMLAttributes } from 'react';
import { cx } from './cx';

type Size = 'default' | 'narrow' | 'wide';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: Size;
}

export default function Container({
  size = 'default',
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={cx(
        'container',
        size === 'narrow' && 'container--narrow',
        size === 'wide' && 'container--wide',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
