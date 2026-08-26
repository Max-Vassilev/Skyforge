import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  id,
  className,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? (label ? `input-${autoId}` : undefined);

  return (
    <div className="field">
      {label != null && (
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cx('input', error != null && 'input--error', className)}
        aria-invalid={error != null || undefined}
        {...rest}
      />
      {hint != null && error == null && <span className="field__hint">{hint}</span>}
      {error != null && <span className="field__error">{error}</span>}
    </div>
  );
}
