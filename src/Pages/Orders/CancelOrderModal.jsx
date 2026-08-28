import { useEffect, useState } from "react";
import { MdWarningAmber } from "react-icons/md";
import CustomModal from "../../Components/Modal/Modal";
import { CUSTOMER_STATUS_BADGE, CUSTOMER_STATUS_LABELS } from "../../Constant/Constant";
import { formatCurrency } from "../../Utils/utils";
import { cancelOrder } from "./orderService";

// Cancel-with-confirmation, reachable directly from the Orders list (see
// Pages/Orders/OrdersTable.jsx's per-row Cancel button) — not a separate
// cancellation implementation, just a confirmation UX wrapper around the
// exact same cancelOrder() service call / adminOrderController.cancelOrder
// endpoint the order detail page's own cancel flow already uses (refunds a
// paid prepaid order via Razorpay, cancels the Shiprocket pickup first if a
// shipment exists, restocks, emails).
const CancelOrderModal = ({ order, onClose, onCancelled }) => {
  const [reason, setReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState(null);

  // A stale reason/error from a previous order targeted through this same
  // modal instance shouldn't carry over to the next one.
  useEffect(() => {
    setReason("");
    setError(null);
  }, [order?.id]);

  if (!order) return null;

  const handleConfirm = async () => {
    setError(null);
    const success = await cancelOrder(order.id, reason.trim(), onCancelled, setIsCancelling, setError);
    if (success) onClose();
    // On failure, cancelOrder() already toasts the reason — the modal stays
    // open with that same message shown inline too (see `error` below),
    // since a toast alone can fade or scroll out of view before it's read.
  };

  return (
    <CustomModal
      open={!!order}
      onClose={onClose}
      title="Cancel this order?"
      confirmLabel="Confirm Cancellation"
      confirmVariant="danger"
      isLoading={isCancelling}
      onConfirm={handleConfirm}
      body={
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <span className="font-semibold" style={{ color: "var(--text)" }}>
                {order.orderNumber}
              </span>
              <span className={CUSTOMER_STATUS_BADGE[order.customerStatus] || "badge-muted"}>
                {CUSTOMER_STATUS_LABELS[order.customerStatus] || order.customerStatus}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">{order.Customer?.name || order.shippingName || "-"}</p>
            <p className="mt-1 text-sm font-medium" style={{ color: "var(--text)" }}>
              {formatCurrency(order.total)}
            </p>
          </div>

          <p className="text-xs text-muted">
            {order.paymentMethod === "prepaid" && order.paymentStatus !== "paid" ? (
              "This order was never actually paid for, so there's nothing to restock or refund — cancelling just marks it cancelled."
            ) : (
              <>
                This will restock the items
                {order.paymentMethod === "prepaid" && order.paymentStatus === "paid" ? ", refund the payment," : ""}
                {order.shiprocketShipmentId ? " and attempt to cancel the Shiprocket shipment." : "."}
              </>
            )}
          </p>

          <div className="formGroup !mb-0">
            <label className="form-label" htmlFor="cancel-order-reason">
              Reason <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <textarea
              id="cancel-order-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this order being cancelled?"
              rows={3}
              className="inputBox w-full"
            />
          </div>

          {error && (
            <div
              className="flex items-start gap-2 rounded-lg border p-3 text-sm"
              style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
            >
              <MdWarningAmber size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      }
    />
  );
};

export default CancelOrderModal;
