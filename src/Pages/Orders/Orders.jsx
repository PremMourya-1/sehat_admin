import { useEffect, useState } from "react";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Table from "../../Components/Table/Table";
import UseFilter from "../../Hooks/UseFilter";
import useOrdersColumns from "./OrdersTable";
import { getOrderData, updateOrderStatus } from "./orderService";

const Orders = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { search, setSearch, filteredData } = UseFilter(data, ["orderNumber", "couponCode"]);

  useEffect(() => {
    getOrderData(setData, setIsLoading);
  }, []);

  const columns = useOrdersColumns({
    onStatusChange: (id, status) => updateOrderStatus(id, status, setData),
  });

  return (
    <div>
      <BreadCrumb title="Orders" items={[{ label: "Orders" }]} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order number or coupon..."
          className="inputBox max-w-xs"
        />
      </div>

      <Table columns={columns} data={filteredData} isLoading={isLoading} emptyMessage="No orders found" />
    </div>
  );
};

export default Orders;
