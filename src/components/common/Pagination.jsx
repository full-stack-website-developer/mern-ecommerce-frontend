function getVisiblePages(current, total, siblingCount = 1, boundaryCount = 1) {
  const safeCurrent = Math.min(Math.max(1, current), total);
  const startPages = Array.from({ length: Math.min(boundaryCount, total) }, (_, i) => i + 1);
  const endPages = Array.from(
    { length: Math.min(boundaryCount, total) },
    (_, i) => total - Math.min(boundaryCount, total) + 1 + i
  );

  const siblingsStart = Math.max(
    Math.min(
      safeCurrent - siblingCount,
      total - boundaryCount - siblingCount * 2 - 1
    ),
    boundaryCount + 2
  );
  const siblingsEnd = Math.min(
    Math.max(
      safeCurrent + siblingCount,
      boundaryCount + siblingCount * 2 + 2
    ),
    endPages.length > 0 ? endPages[0] - 2 : total - 1
  );

  const pages = [];
  pages.push(...startPages);

  if (siblingsStart > boundaryCount + 2) pages.push('ellipsis-start');
  else if (boundaryCount + 1 < total - boundaryCount) pages.push(boundaryCount + 1);

  for (let p = siblingsStart; p <= siblingsEnd; p++) pages.push(p);

  if (siblingsEnd < total - boundaryCount - 1) pages.push('ellipsis-end');
  else if (total - boundaryCount > boundaryCount) pages.push(total - boundaryCount);

  pages.push(...endPages);

  // dedupe while preserving order
  const seen = new Set();
  return pages.filter((p) => {
    const key = String(p);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  siblingCount = 1,
  boundaryCount = 1,
  showFirstLast = true,
  scrollToTop = false,
}) => {
  if (totalPages <= 1) return null;

  const safeCurrent = Math.min(Math.max(1, Number(currentPage) || 1), totalPages);
  const pages = getVisiblePages(safeCurrent, totalPages, siblingCount, boundaryCount);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === safeCurrent) return;
    onPageChange(page);
    if (scrollToTop) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const baseBtn =
    'px-3 py-2 border rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed';
  const activeBtn = 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700';

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
      {showFirstLast && (
        <button
          type="button"
          onClick={() => goToPage(1)}
          disabled={safeCurrent <= 1}
          className={baseBtn}
        >
          First
        </button>
      )}

      <button
        type="button"
        onClick={() => goToPage(safeCurrent - 1)}
        disabled={safeCurrent <= 1}
        className={baseBtn}
      >
        Prev
      </button>

      {pages.map((p) => {
        if (typeof p === 'string' && p.startsWith('ellipsis')) {
          return (
            <span key={p} className="px-2 text-gray-500 select-none">
              …
            </span>
          );
        }

        const page = Number(p);
        return (
          <button
            key={page}
            type="button"
            onClick={() => goToPage(page)}
            className={`${baseBtn} ${page === safeCurrent ? activeBtn : ''}`}
            aria-current={page === safeCurrent ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => goToPage(safeCurrent + 1)}
        disabled={safeCurrent >= totalPages}
        className={baseBtn}
      >
        Next
      </button>

      {showFirstLast && (
        <button
          type="button"
          onClick={() => goToPage(totalPages)}
          disabled={safeCurrent >= totalPages}
          className={baseBtn}
        >
          Last
        </button>
      )}
    </div>
  );
};

export default Pagination;
