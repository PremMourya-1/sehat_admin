import OrdersList from "./OrdersList";

// Every customerStatus an order passes through once it's actually left the
// warehouse — "dispatched" itself, plus everything downstream in
// utils/shiprocket.js's STATUS_PROGRESSION (picked_up/in_transit/
// out_for_delivery/delivered), plus "rto" (a shipment can only be returned
// after having been sent out in the first place). Deliberately excludes
// "confirmed"/"payment_pending"/"payment_failed" (never dispatched yet) and
// "cancelled" (finalizeCancellation overwrites customerStatus to
// "cancelled" outright, even if the order had been dispatched before —
// so a cancelled order's *current* status is "cancelled", not one of
// these, and it correctly drops off this list the moment it's cancelled).
const DISPATCHED_STATUSES = ["dispatched", "picked_up", "in_transit", "out_for_delivery", "delivered", "rto"];

const DispatchedOrders = () => (
  <OrdersList
    restrictToStatuses={DISPATCHED_STATUSES}
    showLabelStatusFilter={false}
    defaultDateFilter="all"
    title="Dispatched Orders"
    breadcrumbItems={[{ label: "Orders", path: "/orders" }, { label: "Dispatched Orders" }]}
  />
);

export default DispatchedOrders;
