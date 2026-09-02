import { useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import toast from "react-hot-toast";
import { FiCopy, FiXCircle } from "react-icons/fi";
import ActionButtons from "../../Components/Common/ActionButtons/ActionButtons";
import HoverCard from "../../Components/HoverCard/HoverCard";
import { CUSTOMER_STATUS_BADGE, CUSTOMER_STATUS_LABELS, NON_ACTIONABLE_CUSTOMER_STATUSES } from "../../Constant/Constant";
import { formatCurrency, formatDate, getImageUrl } from "../../Utils/utils";

// Shared by the AWB cell below — copies the AWB number to the clipboard so
// an admin pasting it into Shiprocket's own tracking search (or a customer
// WhatsApp message) never has to select-and-copy the text by hand.
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${text}`);
  } catch {
    toast.error("Could not copy — your browser may be blocking clipboard access");
  }
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
const useOrdersColumns = ({ selectedIds, onToggleSelect, onCancelClick }) => {
  const navigate = useNavigate();

  return [
    {
      key: "select",
      label: "",
      width: "36px",
      render: (row) => {
        // Cancelled/payment-pending/payment-failed orders are never
        // eligible for the bulk "Generate Label" action (see
        // OrdersList.jsx's isEligible) — the checkbox is disabled rather
        // than silently skipping the order later, so it's never selectable
        // in the first place.
        const isNonActionable = NON_ACTIONABLE_CUSTOMER_STATUSES.includes(row.customerStatus);
        return (
          <input
            type="checkbox"
            checked={selectedIds.has(row.id)}
            onChange={() => onToggleSelect(row.id)}
            disabled={isNonActionable}
            className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Select order ${row.orderNumber}`}
            title={isNonActionable ? `${CUSTOMER_STATUS_LABELS[row.customerStatus] || row.customerStatus} — not eligible for label generation` : undefined}
          />
        );
      },
    },
    {
      key: "product",
      label: "Product",
      // Pinned while the rest of this (quite wide) table scrolls
      // horizontally on mobile — see Table.jsx's `sticky` doc comment —
      // so scrolling right to see Amount/Status/Shipping/etc. never loses
      // track of which order's row you're looking at.
      sticky: true,
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
      key: "awbCode",
      label: "AWB No.",
      render: (row) =>
        row.awbCode ? (
          <Tippy content="Click to copy">
            <button
              type="button"
              onClick={() => copyToClipboard(row.awbCode)}
              className="flex items-center gap-1.5 hover:underline"
              style={{ color: "var(--text)" }}
            >
              {row.awbCode}
              <FiCopy size={12} className="text-muted" />
            </button>
          </Tippy>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      // Pickup date, actual shipping cost, and estimated delivery used to be
      // 3 separate columns — merged into one compact "Shipping" cell (each
      // line labeled, so it's still immediately clear which value is which
      // without needing 3 header labels' worth of horizontal space).
      key: "shippingInfo",
      label: "Shipping",
      render: (row) => (
        <div className="flex flex-col gap-0.5 text-xs whitespace-nowrap">
          <span>
            <span className="text-muted">Pickup: </span>
            {formatDate(row.pickupDate)}
          </span>
          <span>
            <span className="text-muted">Cost: </span>
            {row.shippingCostActual !== null && row.shippingCostActual !== undefined
              ? formatCurrency(row.shippingCostActual)
              : "-"}
          </span>
          <span>
            <span className="text-muted">Est. Delivery: </span>
            {formatDate(row.estimatedDeliveryDate)}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        // Matches adminOrderController.cancelOrder's real behavior exactly
        // (re-confirmed by re-reading it, not assumed): it only ever blocks
        // an already-"cancelled" order. "delivered" is NOT special-cased
        // there beyond skipping the now-pointless Shiprocket pickup-cancel
        // step, so it stays cancellable here too — every other status,
        // including the legacy payment_pending/payment_failed values some
        // old pre-AbandonedCheckout orders are still stuck at, is
        // cancellable as well. Deliberately NOT reusing
        // NON_ACTIONABLE_CUSTOMER_STATUSES here — that one's specifically
        // about bulk Generate Label eligibility (which genuinely does need
        // paymentStatus "paid" to succeed), a different question from "can
        // this be cancelled". Restocking a never-paid prepaid order used to
        // incorrectly add stock nothing ever took — fixed in utils/
        // orderCancellation.js, so cancelling one of these is now safe.
        const canCancel = row.customerStatus !== "cancelled";
        return (
          <div className="flex items-center gap-2">
            <ActionButtons onView={() => navigate(`/orders/${row.id}`)} />
            {canCancel && (
              <Tippy content="Cancel Order">
                <button
                  type="button"
                  onClick={() => onCancelClick(row)}
                  className="action-icon-delete"
                  aria-label={`Cancel order ${row.orderNumber}`}
                >
                  <FiXCircle />
                </button>
              </Tippy>
            )}
          </div>
        );
      },
    },
  ];
};

export default useOrdersColumns;
