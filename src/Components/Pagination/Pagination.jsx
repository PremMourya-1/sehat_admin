import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { cx } from "../../Utils/utils";

/**
 * Client-side page-number pagination control. All admin lists fetch their
 * full dataset via findAll and filter/paginate in-memory (no server-side
 * pagination endpoints in this API), so this operates purely on page index.
 */
const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="btn-icon disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <MdChevronLeft />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={cx(
            "flex h-8 w-8 items-center justify-center rounded-lg text-sm",
            p === page ? "text-white" : "text-muted hover:bg-[var(--background-light)]",
          )}
          style={p === page ? { backgroundColor: "var(--primary)" } : {}}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="btn-icon disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <MdChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
