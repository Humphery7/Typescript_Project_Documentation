/**
 * Generated product artwork. Products have no photos, so each one gets a quiet
 * line drawing on a muted mineral tone, derived from its id (same id, same drawing).
 */

export const PLATE_W = 120;
export const PLATE_H = 150;
const STROKE = 0.55;

export interface Tone {
  bg: string;
  shape: string;
  line: string;
}

export const TONES: Tone[] = [
  { bg: "#CED5D8", shape: "#BDC7CC", line: "#76868E" }, // slate
  { bg: "#D0D6CB", shape: "#BFC8B9", line: "#7C8A74" }, // sage
  { bg: "#D9D5CC", shape: "#CBC6BA", line: "#8E8776" }, // stone
  { bg: "#D1D9E0", shape: "#BFCAD6", line: "#76889C" }, // mist
  { bg: "#DDCFC6", shape: "#CFBDB1", line: "#93796A" }, // clay
  { bg: "#DADCDC", shape: "#C8CBCB", line: "#858B8B" }, // fog
  { bg: "#C6CEC2", shape: "#B3BFAE", line: "#68785F" }, // moss
];

export interface Prim {
  tag: "g" | "path" | "circle" | "rect" | "line";
  attrs: Record<string, string | number>;
  children?: Prim[];
}

export interface PlateArt {
  tone: Tone;
  prims: Prim[];
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

type Rnd = () => number;
const between = (rnd: Rnd, lo: number, hi: number) => lo + rnd() * (hi - lo);

const stroke = (t: Tone) => ({ fill: "none", stroke: t.line, strokeWidth: STROKE });
const soft = (t: Tone) => ({ fill: t.shape });

function ln(t: Tone, x1: number, y1: number, x2: number, y2: number): Prim {
  return { tag: "line", attrs: { x1: r2(x1), y1: r2(y1), x2: r2(x2), y2: r2(y2), stroke: t.line, strokeWidth: STROKE } };
}

/* ---------- motifs ---------- */

/** Concentric rings around a soft disc. */
function orbit(rnd: Rnd, t: Tone): Prim[] {
  const cx = between(rnd, 36, 84);
  const cy = between(rnd, 50, 100);
  const prims: Prim[] = [
    { tag: "circle", attrs: { cx: r2(cx + 9), cy: r2(cy - 8), r: r2(between(rnd, 26, 38)), ...soft(t) } },
  ];
  const rings = 4 + Math.floor(rnd() * 3);
  for (let i = 0; i < rings; i++) {
    prims.push({ tag: "circle", attrs: { cx: r2(cx), cy: r2(cy), r: 9 + i * 8.5, ...stroke(t) } });
  }
  return prims;
}

/** Nested ellipses over a low horizon, like a topographic map. */
function contours(rnd: Rnd, t: Tone): Prim[] {
  const cx = between(rnd, 30, 90);
  const cy = between(rnd, 40, 90);
  const prims: Prim[] = [{ tag: "rect", attrs: { x: 0, y: 96, width: PLATE_W, height: PLATE_H - 96, ...soft(t) } }];
  const squash = between(rnd, 0.55, 0.85);
  const count = 7 + Math.floor(rnd() * 3);
  for (let i = 0; i < count; i++) {
    const rx = 6 + i * 8;
    prims.push({
      tag: "path",
      attrs: {
        d: `M${r2(cx - rx)} ${r2(cy)}a${r2(rx)} ${r2(rx * squash)} 0 1 0 ${r2(rx * 2)} 0a${r2(rx)} ${r2(rx * squash)} 0 1 0 ${r2(-rx * 2)} 0Z`,
        ...stroke(t),
      },
    });
  }
  return prims;
}

/** Lines radiating from a corner, over a soft quarter disc. */
function fan(rnd: Rnd, t: Tone): Prim[] {
  const corners: Array<[number, number, number]> = [
    [0, 0, 0],
    [PLATE_W, 0, 90],
    [PLATE_W, PLATE_H, 180],
    [0, PLATE_H, 270],
  ];
  const [ox, oy, start] = corners[Math.floor(rnd() * corners.length)] as [number, number, number];
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const r = between(rnd, 60, 84);
  const a0 = rad(start);
  const a1 = rad(start + 90);
  const prims: Prim[] = [
    {
      tag: "path",
      attrs: {
        d: `M${ox} ${oy}L${r2(ox + Math.cos(a0) * r)} ${r2(oy + Math.sin(a0) * r)}A${r2(r)} ${r2(r)} 0 0 1 ${r2(ox + Math.cos(a1) * r)} ${r2(oy + Math.sin(a1) * r)}Z`,
        ...soft(t),
      },
    },
  ];
  const n = 12 + Math.floor(rnd() * 6);
  for (let i = 0; i <= n; i++) {
    const a = rad(start + (90 * i) / n);
    prims.push(ln(t, ox, oy, ox + Math.cos(a) * 230, oy + Math.sin(a) * 230));
  }
  return prims;
}

/** A panel filled with fine diagonal hatching. */
function hatch(rnd: Rnd, t: Tone): Prim[] {
  const w = between(rnd, 48, 78);
  const h = between(rnd, 66, 104);
  const x = between(rnd, 12, PLATE_W - w - 12);
  const y = between(rnd, 14, PLATE_H - h - 14);
  const prims: Prim[] = [
    { tag: "rect", attrs: { x: r2(x + 7), y: r2(y + 7), width: r2(w), height: r2(h), ...soft(t) } },
    { tag: "rect", attrs: { x: r2(x), y: r2(y), width: r2(w), height: r2(h), ...stroke(t) } },
  ];
  const step = 3.4;
  for (let d = -h + step; d < w; d += step) {
    const u0 = Math.max(0, d);
    const u1 = Math.min(w, h + d);
    if (u1 - u0 > 0.5) prims.push(ln(t, x + u0, y + (u0 - d), x + u1, y + (u1 - d)));
  }
  return prims;
}

/** A field of small dots beside a soft shape. */
function dots(rnd: Rnd, t: Tone): Prim[] {
  const prims: Prim[] = [];
  if (rnd() < 0.5) {
    prims.push({ tag: "circle", attrs: { cx: r2(between(rnd, 40, 80)), cy: r2(between(rnd, 50, 100)), r: r2(between(rnd, 28, 40)), ...soft(t) } });
  } else {
    const s = between(rnd, 44, 66);
    prims.push({ tag: "rect", attrs: { x: r2(between(rnd, 14, PLATE_W - s - 14)), y: r2(between(rnd, 20, PLATE_H - s - 20)), width: r2(s), height: r2(s), ...soft(t) } });
  }
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row < 9; row++) {
      prims.push({ tag: "circle", attrs: { cx: 13 + col * 15.7, cy: 13 + row * 15.5, r: 0.95, fill: t.line } });
    }
  }
  return prims;
}

/** Nested doorway arches. */
function arches(rnd: Rnd, t: Tone): Prim[] {
  const w = between(rnd, 62, 86);
  const x0 = (PLATE_W - w) / 2 + between(rnd, -10, 10);
  const top = between(rnd, 26, 56);
  const arch = (x: number, y: number, width: number) => {
    const r = width / 2;
    return `M${r2(x)} ${PLATE_H}L${r2(x)} ${r2(y + r)}A${r2(r)} ${r2(r)} 0 0 1 ${r2(x + width)} ${r2(y + r)}L${r2(x + width)} ${PLATE_H}`;
  };
  const prims: Prim[] = [{ tag: "path", attrs: { d: `${arch(x0 + 8, top + 8, w)}Z`, ...soft(t) } }];
  const count = 4 + Math.floor(rnd() * 2);
  for (let i = 0; i < count; i++) {
    prims.push({ tag: "path", attrs: { d: arch(x0 + i * 7, top + i * 7, w - i * 14), ...stroke(t) } });
  }
  return prims;
}

const MOTIFS = [orbit, contours, fan, hatch, dots, arches];

export function composePlate(seed: string): PlateArt {
  const rnd = mulberry32(hash(seed));
  const tone = TONES[Math.floor(rnd() * TONES.length)] as Tone;
  const motif = MOTIFS[Math.floor(rnd() * MOTIFS.length)] as (r: Rnd, t: Tone) => Prim[];
  const prims = motif(rnd, tone);
  const flip = rnd() < 0.5;
  return {
    tone,
    prims: flip
      ? [{ tag: "g", attrs: { transform: `translate(${PLATE_W} 0) scale(-1 1)` }, children: prims }]
      : prims,
  };
}
