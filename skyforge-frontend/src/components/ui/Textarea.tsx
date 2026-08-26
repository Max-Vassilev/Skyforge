import { useId } from 'react';
import type { TextareaHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
}

export default function Textarea({
  label,
  error,
  hint,
  id,
  className,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? (label ? `textarea-${autoId}` : undefined);

  return (
    <div className="field">
      {label != null && (
        <label className="field__label" htmlFor={textareaId}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cx('textarea', error != null && 'textarea--error', className)}
        aria-invalid={error != null || undefined}
        {...rest}
      />
      {hint != null && error == null && <span className="field__hint">{hint}</span>}
      {error != null && <span className="field__error">{error}</span>}
    </div>
  );
}
