import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import NoRecords from "../../Components/NoRecords/NoRecords";
import { formatCurrency, formatDate } from "../../Utils/utils";
import { ADDED_BY_BADGE_CLASS, addedByLabel } from "./expensesConstants";

// Table on desktop, cards on mobile — same data, two layouts, toggled with
// Tailwind's sm: breakpoint rather than reusing the generic Table component
// (Components/Table/Table.jsx), which only ever renders a table and has no
// card fallback. Both users add expenses from their phones, so this is the
// primary layout, not an afterthought.
//
// This project's Tailwind config uses desktop-first max-width breakpoints
// (tailwind.config.js: sm = "max-width: 640px") — "sm:" below means "at or
// below 640px", the reverse of Tailwind's normal mobile-first default.
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
    <>
      {/* Desktop / tablet table */}
      <div className="w-full overflow-x-auto rounded-xl border sm:hidden" style={{ borderColor: "var(--border)" }}>
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

      {/* Mobile cards */}
      <div className="hidden flex-col gap-3 sm:flex">
        {expenses.map((expense) => (
          <div key={expense.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {expense.itemName}
                </p>
                <p className="mt-0.5 text-xs text-muted">{formatDate(expense.purchaseDate)}</p>
              </div>
              <span className={ADDED_BY_BADGE_CLASS[expense.addedBy] || "badge-muted"}>
                {addedByLabel(expense.addedBy)}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-lg font-semibold" style={{ color: "var(--primary)" }}>
                {formatCurrency(expense.purchasePrice)}
              </p>
              <div className="flex items-center gap-2">
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
            </div>

            {expense.notes && (
              <p className="mt-2 border-t pt-2 text-xs text-muted" style={{ borderColor: "var(--border)" }}>
                {expense.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ExpensesList;
