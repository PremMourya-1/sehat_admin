import OrdersList from "./OrdersList";

// The one customerStatus that means "placed, but hasn't left the warehouse
// yet" under the current architecture — see utils/shiprocket.js's
// STATUS_PROGRESSION (["confirmed", "dispatched", "picked_up", ...]).
// payment_pending/payment_failed are deliberately excluded — those are
// legacy, non-actionable values (see NON_ACTIONABLE_CUSTOMER_STATUSES),
// never a real order genuinely waiting to ship.
const NEEDS_DISPATCH_STATUSES = ["confirmed"];

const NeedsDispatchOrders = () => (
  <OrdersList
    restrictToStatuses={NEEDS_DISPATCH_STATUSES}
    showLabelStatusFilter={false}
    defaultDateFilter="all"
    title="Needs to Dispatch"
    breadcrumbItems={[{ label: "Orders", path: "/orders" }, { label: "Needs to Dispatch" }]}
  />
);

export default NeedsDispatchOrders;
