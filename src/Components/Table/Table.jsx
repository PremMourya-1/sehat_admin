import PreLoader from "../Common/Loader/PreLoader";
import NoRecords from "../NoRecords/NoRecords";

/**
 * Generic column-config table.
 * columns: [{ key, label, render?: (row, index) => node, width?, align?, sticky? }]
 *
 * `sticky: true` on one column (typically the first identifying one, e.g.
 * product/customer name) pins it to the left edge while the rest of a wide
 * table scrolls horizontally underneath — meant for tables with more
 * columns than a phone screen can show, so scrolling right never loses
 * track of which row you're looking at. Only pins at `left: 0`, i.e. only
 * meaningful on the single column closest to the left edge; marking more
 * than one sticky isn't supported (they'd overlap).
 */
const Table = ({ columns = [], data = [], isLoading = false, emptyMessage = "No records found", rowKey = "id" }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
      <table className="customTable">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sticky ? "sticky-col" : undefined}
                style={{ width: col.width, textAlign: col.align || "left" }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!isLoading &&
            data.map((row, index) => (
              <tr key={row[rowKey] ?? index}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={col.sticky ? "sticky-col" : undefined}
                    style={{ textAlign: col.align || "left" }}
                  >
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {isLoading && <PreLoader />}
      {!isLoading && data.length === 0 && <NoRecords message={emptyMessage} />}
    </div>
  );
};

export default Table;
