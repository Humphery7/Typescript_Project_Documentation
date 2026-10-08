import { createElement, memo, useMemo, type ReactNode } from "react";
import { composePlate, PLATE_H, PLATE_W, type Prim } from "../lib/plate";

export function renderPrim(p: Prim, key: number): ReactNode {
  return createElement(p.tag as string, { key, ...p.attrs }, ...(p.children?.map(renderPrim) ?? []));
}

interface PlateProps {
  seed: string;
  soldOut?: boolean;
  className?: string;
}

/** Decorative artwork for a product. The product name and stock are always in text beside it. */
export const Plate = memo(function Plate({ seed, soldOut = false, className = "" }: PlateProps) {
  const art = useMemo(() => composePlate(seed), [seed]);
  const classes = ["plate", soldOut ? "plate--sold" : "", className].filter(Boolean).join(" ");
  return (
    <div className={classes} style={{ background: art.tone.bg }} aria-hidden="true">
      <svg viewBox={`0 0 ${PLATE_W} ${PLATE_H}`} preserveAspectRatio="xMidYMid slice" focusable="false">
        <g className="plate__art">{art.prims.map(renderPrim)}</g>
      </svg>
      {soldOut && <span className="plate__badge">Sold out</span>}
    </div>
  );
});
