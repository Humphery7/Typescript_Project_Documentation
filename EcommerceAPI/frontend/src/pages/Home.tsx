import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import type { Product } from "../types";
import ProductCard from "../components/ProductCard";
import { useAsync } from "../components/useAsync";

interface Res { products: Product[]; pagination: { total: number; page: number; totalPages: number } }
const LIMIT = 12;

export default function Home() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") ?? "", min = sp.get("min") ?? "", max = sp.get("max") ?? "", page = Number(sp.get("page") ?? 1);
  const [text, setText] = useState(q);

  useEffect(() => {
    const t = setTimeout(() => {
      if (text === q) return;
      const n = new URLSearchParams(sp); text ? n.set("q", text) : n.delete("q"); n.delete("page"); setSp(n);
    }, 350);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== "page") n.delete("page"); setSp(n); };

  const { data, error, loading } = useAsync(() => {
    const p = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (q) p.set("search", q); if (min) p.set("minPrice", min); if (max) p.set("maxPrice", max);
    return api<Res>(`/products?${p}`);
  }, [q, min, max, page]);

  const filtered = q || min || max;
  return (
    <>
      <section className="hero">
        <h1>Straight off the shelf.</h1>
        <p className="lede">{data ? `${data.pagination.total} ${data.pagination.total === 1 ? "item" : "items"} in stock right now.` : "Checking the shelves…"} What you see is what we have, and it updates as it sells.</p>
        <label className="search">
          <span className="sr">Search products</span>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search by name or description" />
        </label>
        <div className="price-filter">
          <label>From $<input inputMode="decimal" value={min} onChange={(e) => set("min", e.target.value.replace(/[^\d.]/g, ""))} placeholder="0" /></label>
          <label>to $<input inputMode="decimal" value={max} onChange={(e) => set("max", e.target.value.replace(/[^\d.]/g, ""))} placeholder="any" /></label>
          {filtered && <button className="linkish" onClick={() => { setText(""); setSp({}); }}>Clear filters</button>}
        </div>
      </section>

      {error && <p className="notice bad">{error}</p>}
      {loading && !data && <div className="grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="card skeleton" />)}</div>}
      {data && data.products.length === 0 && (
        <div className="empty"><h2>{filtered ? "Nothing matches that." : "The shelves are empty."}</h2>
          <p>{filtered ? "Try a different word or widen the price range." : "Add your first product from the stock desk (link in the footer)."}</p></div>
      )}
      {data && data.products.length > 0 && <div className={`grid ${loading ? "busy" : ""}`}>{data.products.map((p) => <ProductCard key={p.id} p={p} />)}</div>}

      {data && data.pagination.totalPages > 1 && (
        <div className="pager">
          <button disabled={page <= 1} onClick={() => set("page", String(page - 1))}>Previous</button>
          <span>Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <button disabled={page >= data.pagination.totalPages} onClick={() => set("page", String(page + 1))}>Next</button>
        </div>
      )}
    </>
  );
}
