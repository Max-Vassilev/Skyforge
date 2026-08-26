import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from './cx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  to?: string;
  leftIcon?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  to,
  leftIcon,
  className,
  children,
  type,
  ...rest
}: ButtonProps) {
  const classes = cx(
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    block && 'btn--block',
    className,
  );

  const content = (
    <>
      {leftIcon != null && <span className="btn__icon">{leftIcon}</span>}
      {children}
    </>
  );

  if (to != null) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type ?? 'button'} className={classes} {...rest}>
      {content}
    </button>
  );
}
