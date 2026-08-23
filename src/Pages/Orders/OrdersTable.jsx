import { useNavigate } from "react-router-dom";
import ActionButtons from "../../Components/Common/ActionButtons/ActionButtons";
import { CUSTOMER_STATUS_LABELS } from "../../Constant/Constant";
import { formatCurrency, formatDate } from "../../Utils/utils";

const STATUS_BADGE = {
  pending: "badge-warning",
  processing: "badge-info",
  shipped: "badge-primary",
  delivered: "badge-success",
  cancelled: "badge-danger",
};

const CUSTOMER_STATUS_BADGE = {
  confirmed: "badge-info",
  dispatched: "badge-primary",
  picked_up: "badge-primary",
  in_transit: "badge-primary",
  out_for_delivery: "badge-primary",
  delivered: "badge-success",
  rto: "badge-danger",
  cancelled: "badge-danger",
};

const LABEL_STATUS_BADGE = {
  not_generated: "badge-muted",
  generated: "badge-success",
  failed: "badge-danger",
};

// Order lifecycle (customerStatus/labelStatus) is fully automatic now —
// confirmed on placement, dispatched on label generation — so this table is
// read-only for status; the only action left is viewing the order detail
// page (where "Generate Label" lives) or selecting rows for the bulk
// Generate Label action (see OrdersList.jsx).
const useOrdersColumns = ({ selectedIds, onToggleSelect }) => {
  const navigate = useNavigate();

  return [
    {
      key: "select",
      label: "",
      width: "36px",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => onToggleSelect(row.id)}
          className="h-4 w-4"
          aria-label={`Select order ${row.orderNumber}`}
        />
      ),
    },
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
      render: (row) => <span className={STATUS_BADGE[row.status] || "badge-muted"}>{row.status}</span>,
    },
    {
      key: "customerStatus",
      label: "Customer Status",
      render: (row) => (
        <span className={CUSTOMER_STATUS_BADGE[row.customerStatus] || "badge-muted"}>
          {CUSTOMER_STATUS_LABELS[row.customerStatus] || row.customerStatus}
        </span>
      ),
    },
    {
      key: "labelStatus",
      label: "Label",
      render: (row) => (
        <span className={LABEL_STATUS_BADGE[row.labelStatus] || "badge-muted"}>
          {(row.labelStatus || "not_generated").replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "estimatedDeliveryDate",
      label: "Est. Delivery",
      render: (row) => formatDate(row.estimatedDeliveryDate),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => <ActionButtons onView={() => navigate(`/orders/${row.id}`)} />,
    },
  ];
};

export default useOrdersColumns;
