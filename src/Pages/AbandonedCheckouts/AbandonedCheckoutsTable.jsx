import { formatCurrency, formatDate, getImageUrl } from "../../Utils/utils";

const STATUS_BADGE = {
  pending: "badge-warning",
  expired: "badge-muted",
};

// Read-only listing (see controllers/adminAbandonedCheckoutController.js —
// this is informational for now, no actions) — same product-photo+name+
// weight+quantity cell convention as Pages/Orders/OrdersTable.jsx's own
// "Product" column, so a checkout attempt reads the same way a real
// order's contents would.
const useAbandonedCheckoutColumns = () => [
  {
    key: "items",
    label: "Items",
    sticky: true,
    render: (row) => {
      const items = row.cartItemsSnapshot || [];
      if (items.length === 0) return <span className="text-muted">-</span>;
      return (
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="relative block h-10 w-10 flex-none overflow-hidden rounded-md border"
                style={{ borderColor: "var(--border)" }}
              >
                {item.productImage ? (
                  <img
                    src={getImageUrl(item.productImage)}
                    alt={item.productName || ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full" style={{ backgroundColor: "var(--background-light)" }} />
                )}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {item.productName || "Product"}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  {item.weight && <span className="badge-muted !px-1.5 !py-0">{item.weight}</span>}
                  <span>× {item.quantity}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    key: "customer",
    label: "Customer",
    render: (row) => (
      <div className="flex flex-col leading-tight">
        <span style={{ color: "var(--text)" }}>{row.Customer?.name || row.shippingDetails?.shippingName || "-"}</span>
        {row.Customer?.email && <span className="text-xs text-muted">{row.Customer.email}</span>}
      </div>
    ),
  },
  {
    key: "phone",
    label: "Phone",
    render: (row) => row.shippingDetails?.shippingPhone || "-",
  },
  {
    key: "amount",
    label: "Amount",
    render: (row) => <span className="font-semibold">{formatCurrency(row.totalAmount)}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (row) => <span className={STATUS_BADGE[row.status] || "badge-muted"}>{row.status}</span>,
  },
  { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) },
];

export default useAbandonedCheckoutColumns;
