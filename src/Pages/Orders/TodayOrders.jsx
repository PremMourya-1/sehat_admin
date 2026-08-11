import OrdersList from "./OrdersList";

const TodayOrders = () => (
  <OrdersList
    defaultDateFilter="today"
    title="Today's Orders"
    breadcrumbItems={[{ label: "Orders", path: "/orders" }, { label: "Today's Orders" }]}
  />
);

export default TodayOrders;
