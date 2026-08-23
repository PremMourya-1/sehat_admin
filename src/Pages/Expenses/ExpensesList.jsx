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
const ExpensesList = ({ expenses, isLoading, onEdit, onDelete }) => {
  if (isLoading) return <PreLoader />;
  if (expenses.length === 0) {
    return <NoRecords message="Abhi koi expense add nahi hua. Pehla add karo." />;
  }

  return (
    <>
      {/* Desktop / tablet table — this project's Tailwind config uses
          desktop-first max-width breakpoints (see tailwind.config.js:
          sm = "max-width: 640px"), the reverse of Tailwind's normal
          mobile-first default — so "sm:" here means "at or below 640px",
          not "640px and up". Base classes are the desktop layout; sm:
          overrides swap to the mobile layout. */}
      <div className="w-full overflow-x-auto rounded-lg border sm:hidden" style={{ borderColor: "var(--border)" }}>
        <table className="customTable">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Price</th>
              <th>Date</th>
              <th>Added By</th>
              <th style={{ width: "100px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.itemName}</td>
                <td>{formatCurrency(expense.purchasePrice)}</td>
                <td>{formatDate(expense.purchaseDate)}</td>
                <td>
                  <span className={ADDED_BY_BADGE_CLASS[expense.addedBy] || "badge-muted"}>
                    {addedByLabel(expense.addedBy)}
                  </span>
                </td>
                <td>
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

            {expense.notes && <p className="mt-2 text-xs text-muted">{expense.notes}</p>}
          </div>
        ))}
      </div>
    </>
  );
};

export default ExpensesList;
