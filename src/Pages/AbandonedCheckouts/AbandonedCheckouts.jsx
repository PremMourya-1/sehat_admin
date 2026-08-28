import { useCallback, useMemo, useState } from "react";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Table from "../../Components/Table/Table";
import UseFilter from "../../Hooks/UseFilter";
import usePageReload from "../../Hooks/usePageReload";
import useAbandonedCheckoutColumns from "./AbandonedCheckoutsTable";
import { getAbandonedCheckoutData } from "./abandonedCheckoutService";

const STATUS_OPTIONS = ["pending", "expired"];

// Prepaid checkout attempts before payment succeeds (see
// models/AbandonedCheckout.js on the backend) — deliberately separate from
// Orders everywhere: never counted in the Orders list, Today's Orders, or
// any dashboard/analytics revenue figure, since nothing was ever actually
// paid for one of these. Read-only — no actions here, just visibility into
// what a future remarketing feature would need (who they were, what they
// were trying to buy).
const AbandonedCheckouts = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAbandonedCheckouts = useCallback(
    () =>
      getAbandonedCheckoutData((rows) => {
        // UseFilter only reads top-level keys — flatten the nested
        // customer/shipping fields it needs to search onto each row
        // rather than teaching it dot-paths for this one page.
        setData(
          rows.map((row) => ({
            ...row,
            customerName: row.Customer?.name || row.shippingDetails?.shippingName || "",
            customerEmail: row.Customer?.email || "",
            customerPhone: row.shippingDetails?.shippingPhone || "",
          })),
        );
      }, setIsLoading),
    [],
  );
  usePageReload(fetchAbandonedCheckouts);

  const { search, setSearch, filteredData } = UseFilter(data, ["customerName", "customerEmail", "customerPhone"]);

  const statusFiltered = useMemo(
    () => (statusFilter === "all" ? filteredData : filteredData.filter((c) => c.status === statusFilter)),
    [filteredData, statusFilter],
  );

  const columns = useAbandonedCheckoutColumns();

  return (
    <div>
      <BreadCrumb title="Abandoned Checkouts" items={[{ label: "Abandoned Checkouts" }]} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="inputBox max-w-xs"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="inputBox !w-auto">
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted">{statusFiltered.length} checkout(s)</span>
      </div>

      <Table columns={columns} data={statusFiltered} isLoading={isLoading} emptyMessage="No abandoned checkouts found" />
    </div>
  );
};

export default AbandonedCheckouts;
