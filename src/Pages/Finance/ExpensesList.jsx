import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import NoRecords from "../../Components/NoRecords/NoRecords";
import { formatCurrency, formatDate } from "../../Utils/utils";
import { ADDED_BY_BADGE_CLASS, addedByLabel } from "./financeConstants";

// Always a table, on every screen size — the wrapper's overflow-x-auto lets
// it scroll horizontally on narrow phones rather than reflowing into cards.
const ExpensesList = ({ expenses, isLoading, onEdit, onDelete }) => {
  if (isLoading) return <PreLoader />;
  if (expenses.length === 0) {
    return (
      <div className="card">
        <NoRecords message="Abhi koi expense add nahi hua. Pehla add karo." />
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
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>
                <p className="font-medium" style={{ color: "var(--text)" }}>
                  {expense.itemName}
                </p>
                {expense.notes && (
                  <p className="mt-0.5 max-w-xs truncate text-xs text-muted">{expense.notes}</p>
                )}
              </td>
              <td className="font-semibold" style={{ textAlign: "right", color: "var(--primary)" }}>
                {formatCurrency(expense.purchasePrice)}
              </td>
              <td>{formatDate(expense.purchaseDate)}</td>
              <td>
                <span className={ADDED_BY_BADGE_CLASS[expense.addedBy] || "badge-muted"}>
                  {addedByLabel(expense.addedBy)}
                </span>
              </td>
              <td>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="action-icon-edit"
                    onClick={() => onEdit(expense)}
                    aria-label={`Edit ${expense.itemName}`}
                  >
                    <MdOutlineEdit size={18} />
                  </button>
                  <button
                    type="button"
                    className="action-icon-delete"
                    onClick={() => onDelete(expense)}
                    aria-label={`Delete ${expense.itemName}`}
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

export default ExpensesList;
