// Generated artwork: every product gets a unique, repeatable "plate" derived from its id.
const COLORS = ["#0f1f3a", "#ffd23f", "#ffffff", "#ff7a59", "#2a9d8f", "#8ecae6", "#f4a3c0"];

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export default function Plate({ seed, label }: { seed: string; label?: string }) {
  const r = rng(seed);
  const pick = () => COLORS[Math.floor(r() * COLORS.length)]!;
  const bg = pick();
  let a = pick(); while (a === bg) a = pick();
  let b = pick(); while (b === bg || b === a) b = pick();
  const motif = Math.floor(r() * 4);
  const shapes: JSX.Element[] = [];

  if (motif === 0) {
    const cx = 30 + r() * 40, cy = 30 + r() * 40;
    [46, 34, 22, 10].forEach((rad, i) => shapes.push(<circle key={i} cx={cx} cy={cy} r={rad} fill={i % 2 ? bg : i === 0 ? a : b} />));
  } else if (motif === 1) {
    const n = 5, w = 100 / n;
    for (let i = 0; i < n; i++) { const h = 25 + r() * 65; shapes.push(<rect key={i} x={i * w} y={100 - h} width={w - 3} height={h} fill={i % 2 ? a : b} />); }
  } else if (motif === 2) {
    const hot = Math.floor(r() * 25);
    for (let i = 0; i < 25; i++) {
      const x = 12 + (i % 5) * 19, y = 12 + Math.floor(i / 5) * 19;
      shapes.push(<circle key={i} cx={x} cy={y} r={i === hot ? 11 : 4.5} fill={i === hot ? a : b} />);
    }
  } else {
    shapes.push(<polygon key="p" points={`0,100 100,${20 + r() * 40} 100,100`} fill={a} />);
    shapes.push(<circle key="c" cx={25 + r() * 20} cy={28 + r() * 15} r={14 + r() * 8} fill={b} />);
  }

  return (
    <svg className="plate" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label ?? "Product artwork"}>
      <rect width="100" height="100" fill={bg} />
      {shapes}
    </svg>
  );
}
