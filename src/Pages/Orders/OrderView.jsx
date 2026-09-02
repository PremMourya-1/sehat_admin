import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { FiAlertTriangle, FiXCircle } from "react-icons/fi";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import { CUSTOMER_STATUS_BADGE, CUSTOMER_STATUS_LABELS, NON_ACTIONABLE_CUSTOMER_STATUSES } from "../../Constant/Constant";
import { formatCurrency, formatDate } from "../../Utils/utils";
import { getOrderById, generateOrderLabel, simulateOrderStatus, cancelOrder } from "./orderService";

// Target statuses the test simulator can drive an order to — matches the
// backend's SIMULATABLE_STATUSES (controllers/adminOrderController.js).
// "confirmed"/"dispatched" aren't offered here — those are set elsewhere
// (order creation, label generation), never by a status webhook/simulation.
const SIMULATABLE_STATUSES = ["picked_up", "in_transit", "out_for_delivery", "delivered", "rto"];

// Display order for order.statusHistory (same sequence as the backend's
// STATUS_PROGRESSION in utils/shiprocket.js) — "rto" isn't part of it there
// either, but is included here since it's still a real key statusHistory
// can carry (processStatusUpdate stamps whatever nextStatus it applies).
const STATUS_HISTORY_ORDER = [
  "payment_pending",
  "confirmed",
  "dispatched",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "rto",
];

// Which shipment-pipeline step's error to surface when "Generate Label"
// fails — checked in pipeline order, since a later step's error is only
// possible once every earlier step succeeded.
const FAILURE_STEPS = [
  { statusKey: "shipmentStatus", errorKey: "lastShipmentError", label: "Shipment creation" },
  { statusKey: "awbStatus", errorKey: "lastAwbError", label: "Courier / AWB assignment" },
  { statusKey: "labelStatus", errorKey: "lastLabelError", label: "Label generation" },
  { statusKey: "pickupStatus", errorKey: "lastPickupError", label: "Pickup scheduling" },
];

function getFailedStep(order) {
  return FAILURE_STEPS.find((step) => order[step.statusKey] === "failed");
}

const OrderView = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulateTarget, setSimulateTarget] = useState(SIMULATABLE_STATUSES[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSimulation, setLastSimulation] = useState(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrder = useCallback(() => getOrderById(id, setOrder, setIsLoading), [id]);
  usePageReload(fetchOrder);

  const handleGenerateLabel = () => {
    generateOrderLabel(id, setOrder, setIsGenerating, fetchOrder);
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return;
    const success = await cancelOrder(id, cancelReason.trim(), setOrder, setIsCancelling);
    if (success) {
      setConfirmingCancel(false);
      setCancelReason("");
    }
  };

  const handleSimulateStatus = async () => {
    const result = await simulateOrderStatus(id, simulateTarget, setOrder, setIsSimulating);
    if (result.success) {
      let message;
      let isError = false;
      if (result.skipped) {
        message = "No change — order is already at or past this status.";
      } else if (result.notificationEvent && result.notificationOutcome) {
        // notificationOutcome reports the CHANNEL actually used and whether
        // it really succeeded — see orderService.js simulateOrderStatus for
        // why this matters (a failed WhatsApp send used to be
        // indistinguishable from a successful email one here).
        const channelLabel = result.notificationOutcome.channel === "whatsapp" ? "WhatsApp" : "Email";
        if (result.notificationOutcome.success) {
          message = `customerStatus updated. "${result.notificationEvent}" ${channelLabel} sent.`;
        } else if (result.notificationOutcome.skipped) {
          message = `customerStatus updated. "${result.notificationEvent}" ${channelLabel} already sent earlier (skipped).`;
        } else {
          message = `customerStatus updated, but "${result.notificationEvent}" ${channelLabel} FAILED: ${result.notificationOutcome.error}`;
          isError = true;
        }
      } else {
        message = "customerStatus updated. No notification is wired up for this status yet.";
      }
      setLastSimulation({ message, isError });
    }
  };

  if (isLoading) return <PreLoader />;
  if (!order) return null;

  const failedStep = getFailedStep(order);

  return (
    <div>
      <BreadCrumb
        title={order.orderNumber}
        items={[{ label: "Orders", path: "/orders" }, { label: order.orderNumber }]}
      />

      <div className="grid grid-cols-3 gap-5 lg:grid-cols-1">
        <div className="col-span-2 lg:col-span-1">
          <div className="card mb-5">
            <h3 className="section-title mb-3">Items</h3>
            {/* Long product names + a Combo/Mix badge inline routinely push
                this wider than a phone screen — unlike Components/Table/
                Table.jsx's generic table, this one is hand-rolled and had
                no scroll container of its own, so it used to overflow the
                card (and the whole page) instead of just this table. */}
            <div className="w-full overflow-x-auto">
              <table className="customTable">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.OrderItems || []).map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.Product?.name || "Product"}
                        {item.weight ? ` (${item.weight})` : ""}
                        {item.ComboOffer && (
                          <span className="ml-2 badge-accent">Combo: {item.ComboOffer.title}</span>
                        )}
                        {item.customMixId && (
                          <span className="ml-2 badge-accent">
                            Mix: {item.customMixName || "Custom Mix"}
                          </span>
                        )}
                      </td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <span className="font-semibold" style={{ color: "var(--text)" }}>
                Total
              </span>
              <span className="font-semibold" style={{ color: "var(--text)" }}>
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          <div className="card mb-5">
            <h3 className="section-title mb-3">Delivery Address</h3>
            <p className="text-sm" style={{ color: "var(--text)" }}>
              {order.shippingName} · {order.shippingPhone}
            </p>
            <p className="text-sm text-muted">
              {order.shippingAddress}, {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
            </p>
          </div>

          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="section-title">Shipping Label</h3>
              {order.labelStatus === "generated" ? (
                // A label generated before cancellation stays downloadable
                // as a historical record — this doesn't create a new
                // shipment, so it's fine to leave visible either way.
                <a href={order.labelUrl} target="_blank" rel="noreferrer" className="btn-primary !px-4 !py-1.5 !text-sm">
                  Download Label
                </a>
              ) : NON_ACTIONABLE_CUSTOMER_STATUSES.includes(order.customerStatus) ? (
                <span className="text-xs text-muted">
                  Not available — {(CUSTOMER_STATUS_LABELS[order.customerStatus] || order.customerStatus).toLowerCase()}
                </span>
              ) : (
                <button
                  type="button"
                  className="btn-primary !px-4 !py-1.5 !text-sm"
                  onClick={handleGenerateLabel}
                  disabled={isGenerating}
                >
                  {isGenerating ? <LoaderSpiner size={16} /> : order.labelStatus === "failed" ? "Regenerate" : "Generate Label"}
                </button>
              )}
            </div>

            {failedStep && (
              <p className="text-xs" style={{ color: "var(--danger, #dc2626)" }}>
                {failedStep.label} failed: {order[failedStep.errorKey] || "Unknown error"}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="badge-muted">Shipment: {order.shipmentStatus}</span>
              <span className="badge-muted">AWB: {order.awbStatus}</span>
              <span className="badge-muted">Label: {order.labelStatus}</span>
              <span className="badge-muted">Pickup: {order.pickupStatus}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-5">
            <h3 className="section-title mb-3">Status</h3>
            <div className="flex flex-col gap-2">
              <span className={CUSTOMER_STATUS_BADGE[order.customerStatus] || "badge-muted"}>
                {CUSTOMER_STATUS_LABELS[order.customerStatus] || order.customerStatus}
              </span>
              <span className="text-xs text-muted">Operational: {order.status}</span>
            </div>

            {order.customerStatus === "cancelled" ? (
              <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs text-muted">
                  Cancelled by {order.cancelledBy} on {formatDate(order.cancelledAt, "DD MMM YYYY, hh:mm A")}
                </p>
                {order.cancellationReason && (
                  <p className="mt-1 text-xs" style={{ color: "var(--text)" }}>
                    Reason: {order.cancellationReason}
                  </p>
                )}
                {order.refundStatus && order.refundStatus !== "not_applicable" && (
                  <p className="mt-1 text-xs text-muted">
                    Refund:{" "}
                    {order.refundStatus === "completed"
                      ? `${formatCurrency(order.refundAmount)} completed`
                      : order.refundStatus}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                {!confirmingCancel ? (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-sm font-medium"
                    style={{ color: "var(--danger, #dc2626)" }}
                    onClick={() => setConfirmingCancel(true)}
                  >
                    <FiXCircle size={14} /> Cancel Order
                  </button>
                ) : (
                  <div>
                    <p className="text-xs" style={{ color: "var(--danger, #dc2626)" }}>
                      {order.paymentMethod === "prepaid" && order.paymentStatus !== "paid"
                        ? "This order was never actually paid for, so there's nothing to restock or refund — cancelling just marks it cancelled."
                        : `Cancelling will restock items${order.paymentMethod === "prepaid" && order.paymentStatus === "paid" ? ", refund the payment," : ""} and${order.shiprocketShipmentId ? " attempt to cancel the Shiprocket shipment." : " is final."}`}
                    </p>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Reason for cancelling (required)"
                      rows={2}
                      className="inputBox mt-2 w-full"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="btn-primary !px-4 !py-1.5 !text-sm"
                        style={{ background: "var(--danger, #dc2626)" }}
                        onClick={handleCancelOrder}
                        disabled={isCancelling || !cancelReason.trim()}
                      >
                        {isCancelling ? <LoaderSpiner size={16} /> : "Confirm Cancellation"}
                      </button>
                      <button
                        type="button"
                        className="btn-outline !px-4 !py-1.5 !text-sm"
                        onClick={() => {
                          setConfirmingCancel(false);
                          setCancelReason("");
                        }}
                        disabled={isCancelling}
                      >
                        Never Mind
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card mb-5">
            <h3 className="section-title mb-3">Payment</h3>
            <p className="text-sm" style={{ color: "var(--text)" }}>
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid (Razorpay)"}
            </p>
            <p className="text-xs text-muted">Payment status: {order.paymentStatus}</p>
          </div>

          <div className="card mb-5">
            <h3 className="section-title mb-3">Order Info</h3>
            <p className="text-xs text-muted">Placed on {formatDate(order.createdAt, "DD MMM YYYY, hh:mm A")}</p>
            {order.awbCode && (
              <p className="mt-2 text-xs text-muted">
                AWB {order.awbCode} · {order.courierName}
              </p>
            )}
            {order.shippingCostActual !== null && order.shippingCostActual !== undefined && (
              <p className="mt-2 text-xs text-muted">
                Actual Shipping Cost: <span style={{ color: "var(--text)" }}>{formatCurrency(order.shippingCostActual)}</span>
                {" · "}Charged to customer: {formatCurrency(order.shippingCharge)}
              </p>
            )}
            {order.pickupDate && (
              <p className="mt-2 text-xs text-muted">Pickup expected {formatDate(order.pickupDate, "DD MMM YYYY")}</p>
            )}
            {order.estimatedDeliveryDate && (
              <p className="mt-2 text-xs text-muted">
                Estimated delivery {formatDate(order.estimatedDeliveryDate, "DD MMM YYYY")}
              </p>
            )}
          </div>

          {order.statusHistory && Object.keys(order.statusHistory).length > 0 && (
            <div className="card mb-5">
              <h3 className="section-title mb-3">Status History</h3>
              <ul className="flex flex-col gap-2">
                {STATUS_HISTORY_ORDER.filter((step) => order.statusHistory[step]).map((step) => (
                  <li key={step} className="flex items-center justify-between text-xs">
                    <span className="text-muted">{CUSTOMER_STATUS_LABELS[step] || step}</span>
                    <span>{formatDate(order.statusHistory[step], "DD MMM YYYY, hh:mm A")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Internal testing tool — deliberately styled apart from the
              cards above (dashed border, warning color, explicit label) so
              it reads as "not a normal order action." Works on ANY order,
              including one never pushed to Shiprocket — awbCode/courierName
              simply stay blank in that case. See shiprocket-configuration.md
              "Admin Test Status Simulator". */}
          <div
            className="card"
            style={{ border: "1px dashed var(--warning, #d97706)", background: "var(--warning-tp, #d9770611)" }}
          >
            <h3 className="section-title mb-1 flex items-center gap-1.5" style={{ color: "var(--warning, #d97706)" }}>
              <FiAlertTriangle size={15} /> Test: Simulate Status Update
            </h3>
            <p className="mb-3 text-xs text-muted">
              For testing only — updates customerStatus and triggers the real email pipeline
              through the same code path the real Shiprocket webhook uses. Does not contact
              Shiprocket or affect any real shipment.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={simulateTarget}
                onChange={(e) => setSimulateTarget(e.target.value)}
                className="inputBox flex-1"
                disabled={isSimulating}
              >
                {SIMULATABLE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {CUSTOMER_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-primary !px-4 !py-1.5 !text-sm"
                onClick={handleSimulateStatus}
                disabled={isSimulating}
              >
                {isSimulating ? <LoaderSpiner size={16} /> : "Simulate"}
              </button>
            </div>

            {lastSimulation && (
              <p
                className="mt-3 text-xs"
                style={lastSimulation.isError ? { color: "var(--danger, #dc2626)" } : { color: "var(--muted)" }}
              >
                {lastSimulation.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderView;
