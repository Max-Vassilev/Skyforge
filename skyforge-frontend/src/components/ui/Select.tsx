import { useId } from 'react';
import type { SelectHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
}

export default function Select({
  label,
  error,
  hint,
  id,
  className,
  children,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? (label ? `select-${autoId}` : undefined);

  return (
    <div className="field">
      {label != null && (
        <label className="field__label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cx('select', error != null && 'select--error', className)}
        aria-invalid={error != null || undefined}
        {...rest}
      >
        {children}
      </select>
      {hint != null && error == null && <span className="field__hint">{hint}</span>}
      {error != null && <span className="field__error">{error}</span>}
    </div>
  );
}
