import { useEffect, useState } from "react";
import { MdAdd, MdPointOfSale } from "react-icons/md";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import { cx, formatCurrency } from "../../Utils/utils";
import { FINANCE_USERS } from "./financeConstants";
import { getSalesData, createSale, updateSale, deleteSale } from "./salesService";
import SalesList from "./SalesList";
import SaleModal from "./SaleModal";
import FinanceHeader from "./FinanceHeader";

const FILTER_TABS = [{ value: "all", label: "Sab" }, ...FINANCE_USERS];

const Sales = () => {
  const [addedByFilter, setAddedByFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const [data, setData] = useState({ sales: [], total: 0, count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const fetchSales = () => {
    const filters = { addedBy: addedByFilter };
    if (dateRange.startDate) filters.startDate = dateRange.startDate;
    if (dateRange.endDate) filters.endDate = dateRange.endDate;
    getSalesData(filters, setData, setIsLoading);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fetchSales, [addedByFilter, dateRange.startDate, dateRange.endDate]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (sale) => {
    setEditing(sale);
    setModalOpen(true);
  };

  const handleSubmit = (values) => {
    if (editing) {
      updateSale(editing.id, values, setIsSubmitting, () => {
        setModalOpen(false);
        fetchSales();
      });
    } else {
      createSale(values, setIsSubmitting, () => {
        setModalOpen(false);
        fetchSales();
      });
    }
  };

  const handleConfirmDelete = () => {
    deleteSale(toDelete.id, setIsDeleting, () => {
      setToDelete(null);
      fetchSales();
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* This project's Tailwind config uses desktop-first max-width
          breakpoints (tailwind.config.js: sm = "max-width: 640px") — "sm:"
          below means "at or below 640px" (mobile), the reverse of
          Tailwind's normal mobile-first default. Base classes are the
          desktop layout; sm: overrides are the mobile layout. */}
      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-4 sm:py-5">
        <FinanceHeader title="Sales" />

        {/* Total stat card */}
        <div className="card mb-6 flex items-center gap-5 sm:gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl"
            style={{ backgroundColor: "var(--primary-tp)", color: "var(--primary)" }}
          >
            <MdPointOfSale />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Kul Sale</p>
            <h2 className="mt-1 text-3xl font-semibold sm:text-2xl" style={{ color: "var(--text)" }}>
              {formatCurrency(data.total)}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {data.count} {data.count === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>

        {/* Toolbar: filters + add button */}
        <div className="mb-5 flex flex-row flex-wrap items-center justify-between gap-4 sm:flex-col sm:items-stretch">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setAddedByFilter(tab.value)}
                  className={cx(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150",
                    addedByFilter === tab.value ? "text-white" : "bg-white",
                  )}
                  style={
                    addedByFilter === tab.value
                      ? { backgroundColor: "var(--primary)" }
                      : { border: "1px solid var(--border)", color: "var(--text)" }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2"
              style={{ borderColor: "var(--border)" }}
            >
              <input
                type="date"
                className="border-0 bg-transparent p-0 text-sm outline-none"
                style={{ color: "var(--text)" }}
                value={dateRange.startDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                aria-label="From date"
              />
              <span className="text-xs text-muted">to</span>
              <input
                type="date"
                className="border-0 bg-transparent p-0 text-sm outline-none"
                style={{ color: "var(--text)" }}
                value={dateRange.endDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                aria-label="To date"
              />
            </div>
          </div>

          <button type="button" className="btn-primary shrink-0 sm:w-full" onClick={openAdd}>
            <MdAdd size={18} />
            Add Sale
          </button>
        </div>

        {/* List */}
        <SalesList
          sales={data.sales}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={(sale) => setToDelete(sale)}
        />
      </div>

      <SaleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editing={editing}
        isSubmitting={isSubmitting}
      />

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Pakka delete karna hai?"
        message={`"${toDelete?.itemName}" hamesha ke liye delete ho jaayega.`}
      />
    </div>
  );
};

export default Sales;
