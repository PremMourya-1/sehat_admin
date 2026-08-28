import { useNavigate } from "react-router-dom";
import ActionButtons from "../../Components/Common/ActionButtons/ActionButtons";
import HoverCard from "../../Components/HoverCard/HoverCard";
import { CUSTOMER_STATUS_LABELS } from "../../Constant/Constant";
import { formatCurrency, formatDate, getImageUrl } from "../../Utils/utils";

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
      render: (row) => {
        // Cancelled orders are never eligible for the bulk "Generate
        // Label" action (see OrdersList.jsx's isEligible) — the checkbox
        // is disabled rather than silently skipping the order later, so
        // it's never selectable in the first place.
        const isCancelled = row.customerStatus === "cancelled";
        return (
          <input
            type="checkbox"
            checked={selectedIds.has(row.id)}
            onChange={() => onToggleSelect(row.id)}
            disabled={isCancelled}
            className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Select order ${row.orderNumber}`}
            title={isCancelled ? "Order is cancelled — not eligible for label generation" : undefined}
          />
        );
      },
    },
    {
      key: "product",
      label: "Product",
      render: (row) => {
        const items = row.OrderItems || [];
        if (items.length === 0) return <span className="text-muted">-</span>;
        return (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span
                  className="relative block h-10 w-10 flex-none overflow-hidden rounded-md border"
                  style={{ borderColor: "var(--border)" }}
                >
                  {item.Product?.image ? (
                    <img
                      src={getImageUrl(item.Product.image)}
                      alt={item.Product?.name || ""}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full" style={{ backgroundColor: "var(--background-light)" }} />
                  )}
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {item.Product?.name || item.customMixName || item.ComboOffer?.title || "Product"}
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
      render: (row) => {
        const name = row.Customer?.name || row.shippingName || "-";
        if (name === "-") return <span className="text-muted">-</span>;

        const address = [row.shippingAddress, row.shippingCity, row.shippingState, row.shippingPincode]
          .filter(Boolean)
          .join(", ");

        return (
          <HoverCard
            trigger={
              <span
                className="cursor-default border-b border-dashed"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                {name}
              </span>
            }
          >
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-semibold" style={{ color: "var(--text)" }}>
                {name}
              </p>
              {row.Customer?.email && <p className="text-xs text-muted">{row.Customer.email}</p>}
              <p style={{ color: "var(--text)" }}>{row.shippingPhone || row.Customer?.mobileNumber || "-"}</p>
              <p className="text-xs text-muted">{address || "No address on file"}</p>
            </div>
          </HoverCard>
        );
      },
    },
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
      key: "shippingCostActual",
      label: "Actual Shipping",
      render: (row) =>
        row.shippingCostActual !== null && row.shippingCostActual !== undefined
          ? formatCurrency(row.shippingCostActual)
          : "-",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => <ActionButtons onView={() => navigate(`/orders/${row.id}`)} />,
    },
  ];
};

export default useOrdersColumns;
