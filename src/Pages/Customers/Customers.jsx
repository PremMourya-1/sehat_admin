import { useEffect, useState } from "react";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Table from "../../Components/Table/Table";
import UseFilter from "../../Hooks/UseFilter";
import useCustomersColumns from "./CustomersTable";
import { getCustomerData } from "./customerService";

const Customers = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { search, setSearch, filteredData } = UseFilter(data, ["name", "email", "mobileNumber"]);

  useEffect(() => {
    getCustomerData(setData, setIsLoading);
  }, []);

  const columns = useCustomersColumns();

  return (
    <div>
      <BreadCrumb title="Customers" items={[{ label: "Customers" }]} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="inputBox max-w-xs"
        />
      </div>

      <Table columns={columns} data={filteredData} isLoading={isLoading} emptyMessage="No customers found" />
    </div>
  );
};

export default Customers;
