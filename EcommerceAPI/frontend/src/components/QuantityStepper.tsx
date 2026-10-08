interface Props {
  value: number;
  max: number;
  min?: number;
  disabled?: boolean;
  label: string;
  onChange: (next: number) => void;
}

export function QuantityStepper({ value, max, min = 1, disabled = false, label, onChange }: Props) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
