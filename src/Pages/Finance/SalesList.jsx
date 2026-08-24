import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import NoRecords from "../../Components/NoRecords/NoRecords";
import { formatCurrency, formatDate } from "../../Utils/utils";
import { ADDED_BY_BADGE_CLASS, addedByLabel } from "./financeConstants";

// Always a table, on every screen size — the wrapper's overflow-x-auto lets
// it scroll horizontally on narrow phones rather than reflowing into cards.
const SalesList = ({ sales, isLoading, onEdit, onDelete }) => {
  if (isLoading) return <PreLoader />;
  if (sales.length === 0) {
    return (
      <div className="card">
        <NoRecords message="Abhi koi sale add nahi hui. Pehli add karo." />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
      <table className="customTable">
        <thead>
          <tr>
            <th>Item Name</th>
            <th style={{ textAlign: "right" }}>Price</th>
            <th>Date</th>
            <th>Added By</th>
            <th style={{ width: "110px", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>
                <p className="font-medium" style={{ color: "var(--text)" }}>
                  {sale.itemName}
                </p>
                {sale.notes && (
                  <p className="mt-0.5 max-w-xs truncate text-xs text-muted">{sale.notes}</p>
                )}
              </td>
              <td className="font-semibold" style={{ textAlign: "right", color: "var(--primary)" }}>
                {formatCurrency(sale.salePrice)}
              </td>
              <td>{formatDate(sale.saleDate)}</td>
              <td>
                <span className={ADDED_BY_BADGE_CLASS[sale.addedBy] || "badge-muted"}>
                  {addedByLabel(sale.addedBy)}
                </span>
              </td>
              <td>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="action-icon-edit"
                    onClick={() => onEdit(sale)}
                    aria-label={`Edit ${sale.itemName}`}
                  >
                    <MdOutlineEdit size={18} />
                  </button>
                  <button
                    type="button"
                    className="action-icon-delete"
                    onClick={() => onDelete(sale)}
                    aria-label={`Delete ${sale.itemName}`}
                  >
                    <MdDeleteOutline size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesList;
