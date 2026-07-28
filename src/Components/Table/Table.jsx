import PreLoader from "../Common/Loader/PreLoader";
import NoRecords from "../NoRecords/NoRecords";

/**
 * Generic column-config table.
 * columns: [{ key, label, render?: (row, index) => node, width?, align? }]
 */
const Table = ({ columns = [], data = [], isLoading = false, emptyMessage = "No records found", rowKey = "id" }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
      <table className="customTable">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width, textAlign: col.align || "left" }}>
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
                  <td key={col.key} style={{ textAlign: col.align || "left" }}>
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
