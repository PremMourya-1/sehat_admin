import { cx } from "../../Utils/utils";

/**
 * Generic card container. Used both as a plain content wrapper and as a
 * dashboard stat-tile (pass `title`, `value`, `icon`, `accent`).
 */
const Card = ({ children, className = "", title, value, icon, accent }) => {
  if (title !== undefined || value !== undefined) {
    return (
      <div className={cx("card flex items-center justify-between gap-4", className)}>
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold" style={{ color: "var(--text)" }}>
            {value}
          </h3>
        </div>
        {icon && (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
            style={{
              backgroundColor: accent ? `${accent}22` : "var(--primary-tp)",
              color: accent || "var(--primary)",
            }}
          >
            {icon}
          </div>
        )}
      </div>
    );
  }

  return <div className={cx("card", className)}>{children}</div>;
};

export default Card;
