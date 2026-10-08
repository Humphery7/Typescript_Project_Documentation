export function toNumber(value: string | number): number {
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function money(value: string | number): string {
  return currency.format(toNumber(value));
}

export function splitPrice(value: string | number): { whole: string; cents: string } {
  const [whole = "0", cents = "00"] = toNumber(value).toFixed(2).split(".");
  return { whole: Number(whole).toLocaleString("en-US"), cents };
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function stockNote(inventory: number): string | null {
  if (inventory <= 0) return "Sold out";
  if (inventory <= 5) return `Only ${inventory} left`;
  return null;
}

export function statusInfo(status: string): { label: string; tone: "paid" | "pending" | "muted" } {
  switch (status) {
    case "paid":
      return { label: "Paid", tone: "paid" };
    case "pending":
      return { label: "Awaiting payment", tone: "pending" };
    case "cancelled":
      return { label: "Cancelled", tone: "muted" };
    default:
      return { label: status.charAt(0).toUpperCase() + status.slice(1), tone: "muted" };
  }
}
