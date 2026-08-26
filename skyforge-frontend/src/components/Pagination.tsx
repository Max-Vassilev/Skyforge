export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}

/**
 * Build a windowed list of page numbers with `'…'` gaps.
 * Always shows first & last page, plus a window around the current page.
 */
function buildPages(page: number, totalPages: number): (number | 'ellipsis')[] {
  const window = 1; // pages on each side of the current page
  const pages = new Set<number>([1, totalPages]);
  for (let p = page - window; p <= page + window; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('ellipsis');
    result.push(p);
    prev = p;
  }
  return result;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = buildPages(page, totalPages);
  const go = (p: number) => {
    const next = Math.min(totalPages, Math.max(1, p));
    if (next !== page) onChange(next);
  };

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__btn pagination__nav"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        &lsaquo; Prev
      </button>

      {items.map((item, i) =>
        item === 'ellipsis' ? (
          <span key={`e-${i}`} className="pagination__ellipsis" aria-hidden="true">
            &hellip;
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={
              item === page
                ? 'pagination__btn pagination__btn--active'
                : 'pagination__btn'
            }
            onClick={() => go(item)}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className="pagination__btn pagination__nav"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        Next &rsaquo;
      </button>
    </nav>
  );
}
