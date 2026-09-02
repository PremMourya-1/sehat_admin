import { useState } from "react";
import { FiChevronDown, FiChevronRight, FiPrinter } from "react-icons/fi";
import Card from "../../Components/Card/Card";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import NoRecords from "../../Components/NoRecords/NoRecords";
import { formatCurrency, formatDate } from "../../Utils/utils";
import { getSalesByDate } from "./salesReportService";

const DateWiseReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null); // null = never applied yet
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDates, setExpandedDates] = useState(new Set());

  const canApply = Boolean(startDate && endDate);

  const handleApply = () => {
    if (!canApply) return;
    setExpandedDates(new Set());
    getSalesByDate({ startDate, endDate }, setReport, setIsLoading);
  };

  const toggleExpand = (date) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const days = report?.days || [];
  const totals = {
    revenue: days.reduce((sum, d) => sum + d.revenue, 0),
    orders: days.reduce((sum, d) => sum + d.orderCount, 0),
  };

  return (
    <div>
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Start Date *</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="inputBox !mb-0 !w-auto" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">End Date *</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="inputBox !mb-0 !w-auto" />
          </div>
          <button type="button" className="btn-primary" disabled={!canApply || isLoading} onClick={handleApply}>
            {isLoading ? <LoaderSpiner size={16} /> : "Apply"}
          </button>
          {report && (
            <button type="button" className="btn-outline ml-auto flex items-center gap-1.5" onClick={() => window.print()}>
              <FiPrinter size={14} /> Print
            </button>
          )}
        </div>
        {!canApply && <p className="mt-2 text-xs text-muted">Both a start and end date are required.</p>}
      </Card>

      {isLoading ? (
        <PreLoader />
      ) : report === null ? (
        <NoRecords message="Pick a date range above and click Apply to view the date-wise sales report." height="16rem" />
      ) : days.length === 0 ? (
        <NoRecords message="No sales found for this date range." height="16rem" />
      ) : (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="section-title">
              {days.length} day{days.length === 1 ? "" : "s"} with sales
            </h3>
            <p className="text-sm text-muted">
              Total: <span className="font-semibold" style={{ color: "var(--text)" }}>{formatCurrency(totals.revenue)}</span> ·{" "}
              <span className="font-semibold" style={{ color: "var(--text)" }}>{totals.orders}</span> orders
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {days.map((day) => {
              const isExpanded = expandedDates.has(day.date);
              return (
                <div key={day.date} className="rounded-lg border" style={{ borderColor: "var(--border)" }}>
                  <button
                    type="button"
                    onClick={() => toggleExpand(day.date)}
                    className="flex w-full items-center justify-between gap-3 p-3 text-left"
                  >
                    <span className="flex items-center gap-2">
                      {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                      <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        {formatDate(day.date, "DD MMM YYYY")}
                      </span>
                    </span>
                    <span className="flex items-center gap-4 text-sm">
                      <span className="text-muted">{day.orderCount} order{day.orderCount === 1 ? "" : "s"}</span>
                      <span className="font-semibold" style={{ color: "var(--text)" }}>
                        {formatCurrency(day.revenue)}
                      </span>
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t px-3 pb-3 pt-2" style={{ borderColor: "var(--border)" }}>
                      <div className="w-full overflow-x-auto">
                        <table className="customTable !border-0">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Pack Size</th>
                              <th>Units Sold</th>
                              <th>Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {day.products.flatMap((p) =>
                              (p.variants && p.variants.length > 0 ? p.variants : [{ weight: "-", unitsSold: p.unitsSold, revenue: p.revenue }]).map(
                                (v) => (
                                  <tr key={`${p.productId}-${v.weight}`}>
                                    <td>{p.name}</td>
                                    <td>{v.weight}</td>
                                    <td>{v.unitsSold}</td>
                                    <td>{formatCurrency(v.revenue)}</td>
                                  </tr>
                                ),
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DateWiseReport;
