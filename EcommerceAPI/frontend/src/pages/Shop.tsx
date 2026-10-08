import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Pager } from "../components/Pager";
import { ProductCard } from "../components/ProductCard";
import { EmptyState, ErrorState } from "../components/States";
import { SHOW_ADMIN, STORE_NAME } from "../config";
import { useDebounced, useResource, useTitle } from "../hooks";
import { api } from "../lib/api";

const PAGE_SIZE = 12;

export default function Shop() {
  useTitle(null);
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  // Inputs update instantly; the URL (and the request) follow after a short pause.
  const [draft, setDraft] = useState({ q, min, max });
  const debounced = useDebounced(draft, 350);
  const synced = useRef(`${q}|${min}|${max}`);

  useEffect(() => {
    const nextQ = debounced.q.trim();
    const sig = `${nextQ}|${debounced.min}|${debounced.max}`;
    if (sig === synced.current) return;
    synced.current = sig;
    const next = new URLSearchParams();
    if (nextQ) next.set("q", nextQ);
    if (debounced.min) next.set("min", debounced.min);
    if (debounced.max) next.set("max", debounced.max);
    setParams(next, { replace: true });
  }, [debounced, setParams]);

  // Back/forward buttons change the URL; mirror that into the inputs.
  useEffect(() => {
    const sig = `${q}|${min}|${max}`;
    if (sig === synced.current) return;
    synced.current = sig;
    setDraft({ q, min, max });
  }, [q, min, max]);

  const { data, error, loading, reload } = useResource(
    (signal) => api.products({ search: q, minPrice: min, maxPrice: max, page, limit: PAGE_SIZE, signal }),
    [q, min, max, page],
  );

  const filtered = Boolean(q || min || max);
  const total = data?.pagination.total ?? 0;

  function goToPage(n: number) {
    const next = new URLSearchParams(params);
    next.set("page", String(n));
    setParams(next);
    document.getElementById("catalog")?.scrollIntoView({ block: "start" });
  }

  function clearFilters() {
    synced.current = "||";
    setDraft({ q: "", min: "", max: "" });
    setParams({}, { replace: true });
  }

  return (
    <>
      <section className="intro">
        <h1 className="intro__title">{STORE_NAME}</h1>
        <p className="intro__lede">
          {data ? `${total} ${total === 1 ? "product" : "products"}` : "Loading products"}
        </p>
      </section>

      <section id="catalog" aria-label="Products" className="catalog">
        <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
          <div className="field field--grow">
            <label htmlFor="filter-q">Search</label>
            <input
              id="filter-q"
              type="search"
              value={draft.q}
              maxLength={50}
              placeholder="Name or description"
              onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
            />
          </div>
          <div className="field field--narrow">
            <label htmlFor="filter-min">Min price ($)</label>
            <input
              id="filter-min"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={draft.min}
              onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value }))}
            />
          </div>
          <div className="field field--narrow">
            <label htmlFor="filter-max">Max price ($)</label>
            <input
              id="filter-max"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={draft.max}
              onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))}
            />
          </div>
          {filtered && (
            <button type="button" className="btn btn--ghost filters__clear" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </form>

        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data ? (
          <div className="grid" aria-busy="true" aria-label="Loading products">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="card card--skeleton">
                <div className="plate" />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : data.products.length === 0 ? (
          filtered ? (
            <EmptyState title="Nothing matches those filters">
              <p>Try a shorter search or a wider price range.</p>
              <button type="button" className="btn btn--ghost" onClick={clearFilters}>
                Clear filters
              </button>
            </EmptyState>
          ) : page > 1 ? (
            <EmptyState title="That page is empty">
              <button type="button" className="btn btn--ghost" onClick={() => goToPage(1)}>
                Back to page 1
              </button>
            </EmptyState>
          ) : (
            <EmptyState title="The shelf is empty">
              {SHOW_ADMIN ? (
                <p>
                  <Link to="/admin/new-product">Add the first product</Link> to open the shop.
                </p>
              ) : (
                <p>Nothing is for sale yet. Check back soon.</p>
              )}
            </EmptyState>
          )
        ) : (
          <>
            <div className={loading ? "grid grid--busy" : "grid"} aria-busy={loading}>
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pager pagination={data.pagination} onPage={goToPage} />
          </>
        )}
      </section>
    </>
  );
}
