import { Fragment, useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiChevronRight, FiChevronUp, FiPrinter } from "react-icons/fi";
import Card from "../../Components/Card/Card";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import NoRecords from "../../Components/NoRecords/NoRecords";
import adminApi from "../../Service/api";
import { formatCurrency, getImageUrl } from "../../Utils/utils";
import { getSalesByProduct } from "./salesReportService";

// Client-side toggle sort on the already-loaded (small — one row per
// distinct product sold in the range, never per-order) result set, rather
// than re-fetching per click — the backend's own sortBy/sortDir still
// decides the INITIAL order a fresh Apply loads with.
const SortIcon = ({ active, dir }) => {
  if (!active) return null;
  return dir === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />;
};

const ProductWiseReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [report, setReport] = useState(null); // null = never applied yet (empty-state prompt)
  const [isLoading, setIsLoading] = useState(false);
  const [sortKey, setSortKey] = useState("revenue");
  const [sortDir, setSortDir] = useState("desc");
  const [expandedProducts, setExpandedProducts] = useState(new Set());

  useEffect(() => {
    adminApi.getCategories().then((res) => res.data.action && setCategories(res.data.data));
    adminApi.getProducts().then((res) => res.data.action && setProducts(res.data.data));
  }, []);

  const canApply = Boolean(startDate && endDate);

  const handleApply = () => {
    if (!canApply) return;
    setExpandedProducts(new Set());
    getSalesByProduct(
      { startDate, endDate, ...(categoryId && { categoryId }), ...(productId && { productId }) },
      setReport,
      setIsLoading,
    );
  };

  const toggleExpand = (id) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedProducts = useMemo(() => {
    const list = report?.products || [];
    const sorted = [...list].sort((a, b) => {
      const field = sortKey === "units" ? "unitsSold" : "revenue";
      return a[field] - b[field];
    });
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [report, sortKey, sortDir]);

  const totalUnits = sortedProducts.reduce((sum, p) => sum + p.unitsSold, 0);
  const totalRevenue = sortedProducts.reduce((sum, p) => sum + p.revenue, 0);

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
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Category (optional)</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="inputBox !mb-0 !w-auto">
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Product (optional)</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="inputBox !mb-0 !w-auto">
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
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
        <NoRecords message="Pick a date range above and click Apply to view the product-wise sales report." height="16rem" />
      ) : sortedProducts.length === 0 ? (
        <NoRecords message="No sales found for this date range / filter." height="16rem" />
      ) : (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="section-title">
              {sortedProducts.length} product{sortedProducts.length === 1 ? "" : "s"} sold
            </h3>
            <p className="text-sm text-muted">
              Total: <span className="font-semibold" style={{ color: "var(--text)" }}>{totalUnits}</span> units ·{" "}
              <span className="font-semibold" style={{ color: "var(--text)" }}>{formatCurrency(totalRevenue)}</span>
            </p>
          </div>

          <div className="w-full overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <table className="customTable">
              <thead>
                <tr>
                  <th style={{ width: "2rem" }} />
                  <th>Product</th>
                  <th className="cursor-pointer select-none" onClick={() => toggleSort("units")}>
                    <span className="inline-flex items-center gap-1">
                      Units Sold <SortIcon active={sortKey === "units"} dir={sortDir} />
                    </span>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => toggleSort("revenue")}>
                    <span className="inline-flex items-center gap-1">
                      Revenue <SortIcon active={sortKey === "revenue"} dir={sortDir} />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p) => {
                  const isExpanded = expandedProducts.has(p.productId);
                  const hasVariants = (p.variants || []).length > 0;
                  return (
                    <Fragment key={p.productId}>
                      <tr
                        className={hasVariants ? "cursor-pointer" : undefined}
                        onClick={() => hasVariants && toggleExpand(p.productId)}
                      >
                        <td>
                          {hasVariants && (isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />)}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span
                              className="relative block h-9 w-9 flex-none overflow-hidden rounded-md border"
                              style={{ borderColor: "var(--border)" }}
                            >
                              {p.image ? (
                                <img src={getImageUrl(p.image)} alt={p.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full" style={{ backgroundColor: "var(--background-light)" }} />
                              )}
                            </span>
                            <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                              {p.name}
                            </span>
                          </div>
                        </td>
                        <td>{p.unitsSold}</td>
                        <td>{formatCurrency(p.revenue)}</td>
                      </tr>
                      {isExpanded && hasVariants && (
                        <tr key={`${p.productId}-variants`}>
                          <td />
                          <td colSpan={3} className="!py-2">
                            <table className="customTable !border-0">
                              <thead>
                                <tr>
                                  <th>Pack Size</th>
                                  <th>Units Sold</th>
                                  <th>Revenue</th>
                                </tr>
                              </thead>
                              <tbody>
                                {p.variants.map((v) => (
                                  <tr key={v.weight}>
                                    <td>{v.weight}</td>
                                    <td>{v.unitsSold}</td>
                                    <td>{formatCurrency(v.revenue)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductWiseReport;
