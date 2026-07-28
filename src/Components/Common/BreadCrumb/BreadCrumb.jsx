import { Link } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";

/**
 * Simple breadcrumb trail. `items` = [{ label, path? }] — the last item is
 * rendered as plain text (current page), earlier items as links.
 */
const BreadCrumb = ({ title, items = [] }) => {
  return (
    <div className="mb-5">
      {title && (
        <h1 className="font-heading text-xl font-semibold" style={{ color: "var(--text)" }}>
          {title}
        </h1>
      )}
      {items.length > 0 && (
        <div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <span key={index} className="flex items-center gap-1">
                {item.path && !isLast ? (
                  <Link to={item.path} className="hover:underline" style={{ color: "var(--primary)" }}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "" : ""}>{item.label}</span>
                )}
                {!isLast && <MdChevronRight />}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BreadCrumb;
