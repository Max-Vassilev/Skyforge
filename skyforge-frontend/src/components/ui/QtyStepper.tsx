import IconButton from './IconButton';

export interface QtyStepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: QtyStepperProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const dec = () => onChange(clamp(value - 1));
  const inc = () => onChange(clamp(value + 1));

  return (
    <div className="qty">
      <IconButton
        label="Decrease quantity"
        onClick={dec}
        disabled={disabled || value <= min}
      >
        &minus;
      </IconButton>
      <span className="qty__value" aria-live="polite">
        {value}
      </span>
      <IconButton
        label="Increase quantity"
        onClick={inc}
        disabled={disabled || value >= max}
      >
        +
      </IconButton>
    </div>
  );
}
