import type { Pagination } from "../lib/types";

export function Pager({ pagination, onPage }: { pagination: Pagination; onPage: (page: number) => void }) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;
  return (
    <nav className="pager" aria-label="Pagination">
      <button type="button" className="btn btn--ghost btn--small" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn btn--ghost btn--small"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
