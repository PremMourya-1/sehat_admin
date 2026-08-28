import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Table from "../../Components/Table/Table";
import Pagination from "../../Components/Pagination/Pagination";
import Showing from "../../Components/Pagination/Showing";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import UseFilter from "../../Hooks/UseFilter";
import usePageReload from "../../Hooks/usePageReload";
import {
  ORDER_STATUS_OPTIONS,
  CUSTOMER_STATUS_LABELS,
} from "../../Constant/Constant";
import useOrdersColumns from "./OrdersTable";
import {
  getOrderData,
  generateOrderLabelResult,
  downloadOrderLabels,
} from "./orderService";

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

const LABEL_STATUS_OPTIONS = ["not_generated", "generated", "failed"];
const CUSTOMER_STATUS_OPTIONS = Object.keys(CUSTOMER_STATUS_LABELS);

function matchesDateFilter(order, dateFilter) {
  if (dateFilter === "all") return true;
  const created = dayjs(order.createdAt);
  const now = dayjs();
  if (dateFilter === "today") return created.isSame(now, "day");
  if (dateFilter === "yesterday")
    return created.isSame(now.subtract(1, "day"), "day");
  if (dateFilter === "week") return created.isAfter(now.startOf("week"));
  if (dateFilter === "month") return created.isSame(now, "month");
  return true;
}

// Shared by both the main Orders page and the Today's Orders page (see
// Orders.jsx / TodayOrders.jsx) — `defaultDateFilter` just seeds the initial
// date-filter value, it's still changeable from either entry point.
const OrdersList = ({
  defaultDateFilter = "all",
  title = "Orders",
  breadcrumbItems = [{ label: "Orders" }],
}) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(defaultDateFilter);
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerStatusFilter, setCustomerStatusFilter] = useState("all");
  const [labelStatusFilter, setLabelStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
  const [bulkResults, setBulkResults] = useState(null);
  const [isDownloadingLabels, setIsDownloadingLabels] = useState(false);

  const {
    search,
    setSearch,
    filteredData: searchFiltered,
  } = UseFilter(data, ["orderNumber", "couponCode"]);

  const fetchOrders = useCallback(
    () => getOrderData(setData, setIsLoading),
    [],
  );
  usePageReload(fetchOrders);

  const filteredData = useMemo(
    () =>
      searchFiltered.filter(
        (order) =>
          (statusFilter === "all" || order.status === statusFilter) &&
          (customerStatusFilter === "all" ||
            order.customerStatus === customerStatusFilter) &&
          (labelStatusFilter === "all" ||
            (order.labelStatus || "not_generated") === labelStatusFilter) &&
          matchesDateFilter(order, dateFilter),
      ),
    [
      searchFiltered,
      statusFilter,
      customerStatusFilter,
      labelStatusFilter,
      dateFilter,
    ],
  );

  // Any filter/search change can shift which page makes sense — and a
  // filtered-out selection would otherwise silently apply a bulk action to
  // orders the admin can no longer see.
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
    setBulkResults(null);
  }, [
    search,
    statusFilter,
    customerStatusFilter,
    labelStatusFilter,
    dateFilter,
  ]);

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

  // Cancelled orders' checkboxes are disabled (see OrdersTable.jsx) — kept
  // out of both the "are they all selected" check and what "select all"
  // actually selects, so it can never look/behave as if a cancelled order
  // got selected.
  const selectableVisible = useMemo(
    () => pageData.filter((order) => order.customerStatus !== "cancelled"),
    [pageData],
  );
  const allVisibleSelected =
    selectableVisible.length > 0 && selectableVisible.every((order) => selectedIds.has(order.id));
  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected)
        selectableVisible.forEach((order) => next.delete(order.id));
      else selectableVisible.forEach((order) => next.add(order.id));
      return next;
    });
  };

  // Orders that already have a label, or are cancelled, are skipped rather
  // than re-processed — same skip-already-done behavior
  // generateLabelAndFulfill/validateOrderForShipment already enforce
  // per-step server-side (a cancelled order fails there with "Order is
  // cancelled" — see utils/shiprocket.js), just decided up front here so
  // the progress count and summary reflect it honestly, and so the bulk run
  // doesn't burn a request on something the backend would've rejected anyway.
  const handleBulkGenerateLabel = async () => {
    const selectedOrders = data.filter((order) => selectedIds.has(order.id));
    const isEligible = (order) => order.labelStatus !== "generated" && order.customerStatus !== "cancelled";
    const toProcess = selectedOrders.filter(isEligible);
    const skipped = selectedOrders.filter((order) => !isEligible(order));

    setBulkResults(null);
    setIsBulkRunning(true);
    setBulkProgress({ done: 0, total: toProcess.length });

    const succeeded = [];
    const failed = [];

    // Sequential, not Promise.all — each call makes real Shiprocket API
    // requests, and running many at once risks rate-limiting/races on
    // Shiprocket's side (same reasoning as the old bulk-status endpoint).
    for (const order of toProcess) {
      const result = await generateOrderLabelResult(order.id);
      if (result.success) {
        succeeded.push({ id: order.id, orderNumber: order.orderNumber });
        setData((prev) =>
          prev.map((item) => (item.id === order.id ? result.order : item)),
        );
      } else {
        failed.push({
          id: order.id,
          orderNumber: order.orderNumber,
          error: result.error,
        });
      }
      setBulkProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }

    setBulkResults({
      succeeded,
      failed,
      skipped: skipped.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        reason: order.customerStatus === "cancelled" ? "cancelled" : "already labeled",
      })),
    });
    setIsBulkRunning(false);
    setSelectedIds(new Set());
  };

  const downloadableSelectedIds = useMemo(
    () =>
      data
        .filter(
          (order) =>
            selectedIds.has(order.id) && order.labelStatus === "generated",
        )
        .map((order) => order.id),
    [data, selectedIds],
  );

  const handleDownloadLabels = async () => {
    if (downloadableSelectedIds.length === 0) return;
    setIsDownloadingLabels(true);
    await downloadOrderLabels(downloadableSelectedIds, selectedIds.size);
    setIsDownloadingLabels(false);
  };

  const columns = useOrdersColumns({
    selectedIds,
    onToggleSelect: toggleSelect,
  });

  return (
    <div>
      <BreadCrumb title={title} items={breadcrumbItems} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order number or coupon..."
          className="inputBox max-w-xs"
        />

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="inputBox !w-auto"
        >
          {DATE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="inputBox !w-auto"
        >
          <option value="all">All Statuses</option>
          {ORDER_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={customerStatusFilter}
          onChange={(e) => setCustomerStatusFilter(e.target.value)}
          className="inputBox !w-auto"
        >
          <option value="all">All Customer Statuses</option>
          {CUSTOMER_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {CUSTOMER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <select
          value={labelStatusFilter}
          onChange={(e) => setLabelStatusFilter(e.target.value)}
          className="inputBox !w-auto"
        >
          <option value="all">All Label Statuses</option>
          {LABEL_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleSelectAllVisible}
            className="h-4 w-4"
          />
          Select all on this page
        </label>
      </div>

      {selectedIds.size > 0 && (
        <div
          className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border p-3"
          style={{ borderColor: "var(--border)" }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text)" }}
          >
            {selectedIds.size} order(s) selected
          </span>
          <button
            type="button"
            className="btn-primary !px-4 !py-1.5 !text-sm"
            disabled={isBulkRunning}
            onClick={handleBulkGenerateLabel}
          >
            {isBulkRunning ? (
              <span className="flex items-center gap-2">
                <LoaderSpiner size={16} /> {bulkProgress.done} of{" "}
                {bulkProgress.total} processed
              </span>
            ) : (
              "Generate Label"
            )}
          </button>
          <button
            type="button"
            className="btn-outline !px-4 !py-1.5 !text-sm"
            disabled={
              isBulkRunning ||
              isDownloadingLabels ||
              downloadableSelectedIds.length === 0
            }
            onClick={handleDownloadLabels}
            title={
              downloadableSelectedIds.length === 0
                ? "None of the selected orders have a generated label yet"
                : undefined
            }
          >
            {isDownloadingLabels ? (
              <LoaderSpiner size={16} />
            ) : (
              "Download Labels"
            )}
          </button>
          <button
            type="button"
            className="btn-outline !px-4 !py-1.5 !text-sm"
            onClick={() => setSelectedIds(new Set())}
            disabled={isBulkRunning}
          >
            Clear Selection
          </button>
        </div>
      )}

      {bulkResults && (
        <div
          className="mb-4 rounded-lg border p-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="badge-success">
                {bulkResults.succeeded.length} succeeded
              </span>
              <span className="badge-danger">
                {bulkResults.failed.length} failed
              </span>
              <span className="badge-muted">
                {bulkResults.skipped.length} skipped (already labeled or cancelled)
              </span>
            </div>
            <button
              type="button"
              className="btn-outline !px-3 !py-1 !text-xs"
              onClick={() => setBulkResults(null)}
            >
              Dismiss
            </button>
          </div>

          {bulkResults.failed.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {bulkResults.failed.map((item) => (
                <li
                  key={item.id}
                  className="text-xs"
                  style={{ color: "var(--danger, #dc2626)" }}
                >
                  {item.orderNumber}: {item.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Table
        columns={columns}
        data={pageData}
        isLoading={isLoading}
        emptyMessage="No orders found"
      />

      {!isLoading && filteredData.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Showing
            page={page}
            pageSize={PAGE_SIZE}
            total={filteredData.length}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default OrdersList;
