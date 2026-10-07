export default function Qty({ value, max, onChange, disabled }: { value: number; max: number; onChange: (n: number) => void; disabled?: boolean }) {
  return (
    <div className="qty" aria-label="Quantity">
      <button type="button" disabled={disabled || value <= 0} onClick={() => onChange(value - 1)} aria-label="Decrease">−</button>
      <output>{value}</output>
      <button type="button" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label="Increase">+</button>
    </div>
  );
}
