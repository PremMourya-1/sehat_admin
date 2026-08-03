import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Table from "../../Components/Table/Table";
import Pagination from "../../Components/Pagination/Pagination";
import Showing from "../../Components/Pagination/Showing";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import UseFilter from "../../Hooks/UseFilter";
import usePageReload from "../../Hooks/usePageReload";
import { ORDER_STATUS_OPTIONS } from "../../Constant/Constant";
import useOrdersColumns from "./OrdersTable";
import { getOrderData, updateOrderStatus, bulkUpdateOrderStatus } from "./orderService";

const PAGE_SIZE = 20;

// Framed as an easy quick-pick for the admin's day-to-day workflow (mainly
// "what came in today that needs processing") rather than raw date pickers.
const DATE_FILTERS = [
  { value: "all", label: "All Orders" },
  { value: "today", label: "Today's Orders" },
  { value: "yesterday", label: "Yesterday's Orders" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

function matchesDateFilter(order, dateFilter) {
  if (dateFilter === "all") return true;
  const created = dayjs(order.createdAt);
  const now = dayjs();
  if (dateFilter === "today") return created.isSame(now, "day");
  if (dateFilter === "yesterday") return created.isSame(now.subtract(1, "day"), "day");
  if (dateFilter === "week") return created.isAfter(now.startOf("week"));
  if (dateFilter === "month") return created.isSame(now, "month");
  return true;
}

const Orders = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  const { search, setSearch, filteredData: searchFiltered } = UseFilter(data, ["orderNumber", "couponCode"]);

  const fetchOrders = useCallback(() => getOrderData(setData, setIsLoading), []);
  usePageReload(fetchOrders);

  const filteredData = useMemo(
    () =>
      searchFiltered.filter(
        (order) =>
          (statusFilter === "all" || order.status === statusFilter) && matchesDateFilter(order, dateFilter),
      ),
    [searchFiltered, statusFilter, dateFilter],
  );

  // Any filter/search change can shift which page makes sense — and a
  // filtered-out selection would otherwise silently apply a bulk action to
  // orders the admin can no longer see.
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [search, statusFilter, dateFilter]);

  const totalPages = Math.max(Math.ceil(filteredData.length / PAGE_SIZE), 1);
  const pageData = useMemo(
    () => filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredData, page],
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected = pageData.length > 0 && pageData.every((order) => selectedIds.has(order.id));
  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) pageData.forEach((order) => next.delete(order.id));
      else pageData.forEach((order) => next.add(order.id));
      return next;
    });
  };

  const handleBulkApply = async () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    const ok = await bulkUpdateOrderStatus(Array.from(selectedIds), bulkStatus, setData, setIsBulkSubmitting);
    if (ok) {
      setSelectedIds(new Set());
      setBulkStatus("");
    }
  };

  const columns = useOrdersColumns({
    onStatusChange: (id, status) => updateOrderStatus(id, status, setData),
    selectedIds,
    onToggleSelect: toggleSelect,
  });

  return (
    <div>
      <BreadCrumb title="Orders" items={[{ label: "Orders" }]} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order number or coupon..."
          className="inputBox max-w-xs"
        />

        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="inputBox !w-auto">
          {DATE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="inputBox !w-auto">
          <option value="all">All Statuses</option>
          {ORDER_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} className="h-4 w-4" />
          Select all on this page
        </label>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
          <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
            {selectedIds.size} order(s) selected
          </span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="inputBox !w-auto !py-1.5 !text-sm">
            <option value="">Change status to...</option>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-primary !px-4 !py-1.5 !text-sm"
            disabled={!bulkStatus || isBulkSubmitting}
            onClick={handleBulkApply}
          >
            {isBulkSubmitting ? <LoaderSpiner size={16} /> : "Apply"}
          </button>
          <button
            type="button"
            className="btn-outline !px-4 !py-1.5 !text-sm"
            onClick={() => setSelectedIds(new Set())}
            disabled={isBulkSubmitting}
          >
            Clear Selection
          </button>
        </div>
      )}

      <Table columns={columns} data={pageData} isLoading={isLoading} emptyMessage="No orders found" />

      {!isLoading && filteredData.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Showing page={page} pageSize={PAGE_SIZE} total={filteredData.length} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default Orders;
