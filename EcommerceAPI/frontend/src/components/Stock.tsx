// Shelf gauge: 10 cells, filled in proportion to stock (full at 20+).
export default function Stock({ n }: { n: number }) {
  const filled = Math.min(10, Math.ceil(Math.min(n, 20) / 2));
  const low = n > 0 && n <= 3;
  return (
    <div className={`stock ${low ? "low" : ""} ${n === 0 ? "out" : ""}`}>
      <span className="cells" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < filled ? "on" : ""} />)}</span>
      <span>{n === 0 ? "Sold out" : low ? `Only ${n} left` : `${n} on the shelf`}</span>
    </div>
  );
}
