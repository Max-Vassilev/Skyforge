import type { ElementType, HTMLAttributes } from 'react';
import { cx } from './cx';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  interactive?: boolean;
}

export default function Card({
  as,
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  const Tag = (as ?? 'div') as ElementType;
  return (
    <Tag
      className={cx('card', interactive && 'card--interactive', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
