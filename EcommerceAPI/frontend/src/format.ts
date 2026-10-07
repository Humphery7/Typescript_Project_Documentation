const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const money = (v: string | number) => fmt.format(Number(v));
export const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
export const shortId = (id: string) => id.slice(0, 8);
