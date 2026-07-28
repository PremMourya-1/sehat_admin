import { ORDER_STATUS_OPTIONS } from "../../Constant/Constant";
import { formatCurrency, formatDate } from "../../Utils/utils";

const STATUS_BADGE = {
  pending: "badge-warning",
  processing: "badge-info",
  shipped: "badge-primary",
  delivered: "badge-success",
  cancelled: "badge-danger",
};

const useOrdersColumns = ({ onStatusChange }) => [
  { key: "orderNumber", label: "Order #" },
  { key: "customer", label: "Customer", render: (row) => row.customer?.name || row.customer?.email || "-" },
  {
    key: "amount",
    label: "Amount",
    render: (row) => (
      <span className="flex items-center gap-2">
        <span className="font-semibold">{formatCurrency(row.total)}</span>
        {Number(row.discountAmount) > 0 && (
          <span className="text-xs text-muted line-through">{formatCurrency(row.subtotal)}</span>
        )}
      </span>
    ),
  },
  {
    key: "coupon",
    label: "Coupon",
    render: (row) => (row.couponCode ? <span className="badge-accent">{row.couponCode}</span> : <span className="text-muted">-</span>),
  },
  { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <div className="flex items-center gap-2">
        <span className={STATUS_BADGE[row.status] || "badge-muted"}>{row.status}</span>
        <select
          className="inputBox !w-auto !py-1 !text-xs"
          value={row.status}
          onChange={(e) => onStatusChange(row.id, e.target.value)}
        >
          {ORDER_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    ),
  },
];

export default useOrdersColumns;
