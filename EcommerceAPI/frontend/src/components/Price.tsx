import { money } from "../lib/format";

export function Price({ value, size = "md" }: { value: string | number; size?: "md" | "lg" }) {
  return <span className={`price price--${size}`}>{money(value)}</span>;
}
