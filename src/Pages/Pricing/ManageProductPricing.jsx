import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Card from "../../Components/Card/Card";
import Table from "../../Components/Table/Table";
import Button from "../../Components/Button/Button";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import UseFilter from "../../Hooks/UseFilter";
import usePageReload from "../../Hooks/usePageReload";
import adminApi from "../../Service/api";
import { formatCurrency } from "../../Utils/utils";
import { getProductData } from "../Product/productService";
import { applyPricingUpdate, getPricingPreview } from "./pricingService";

// Same min-max-range display convention as Pages/Product/ProductTable.jsx's
// renderPrice — duplicated rather than imported since that one is a hook
// (useProductColumns) tied to the Product list page's own delete/edit
// actions, not a standalone helper.
const renderPrice = (row) => {
  const variants = row.variants || [];
  if (variants.length === 0) return "-";
  const prices = variants.map((v) => Number(v.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return <span className="font-semibold">{formatCurrency(min)}</span>;
  return (
    <span className="font-semibold">
      {formatCurrency(min)} - {formatCurrency(max)}
    </span>
  );
};

/**
 * "Manage Product Pricing" — bulk/flexible price adjustment tool. Selection
 * survives switching the category filter (it's a Set of productIds, never
 * cleared on re-filter), so an admin can filter to one category, check a
 * few products, switch filters, and keep building the same selection.
 *
 * Preview is mandatory before Apply: both hit the exact same backend preview
 * math (utils/pricingCalculator.js), and Apply itself re-validates
 * server-side rather than trusting this preview — so this is a true
 * "what you see is what gets written" flow, not just a UI nicety.
 */
const ManageProductPricing = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [controls, setControls] = useState({ direction: "increase", type: "percentage", value: "" });
  const [preview, setPreview] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyResult, setApplyResult] = useState(null);

  const { search, setSearch, filteredData } = UseFilter(products, ["name"]);

  const fetchProducts = useCallback(() => getProductData(setProducts, setIsLoading), []);
  usePageReload(fetchProducts);

  // Plain effect, not usePageReload — same reasoning as Product.jsx's own
  // category dropdown fetch: only one fetch per page can drive the header's
  // reload button, and the product list above is this page's.
  useEffect(() => {
    adminApi
      .getCategories()
      .then((res) => {
        if (res.data.action) setCategories(res.data.data || []);
      })
      .catch(() => {});
  }, []);

  const categoryFiltered = useMemo(
    () => (categoryId ? filteredData.filter((p) => p.categoryId === categoryId) : filteredData),
    [filteredData, categoryId],
  );

  const visibleIds = useMemo(() => categoryFiltered.map((p) => p.id), [categoryFiltered]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  // Any change to selection or the adjustment controls invalidates a
  // previously generated preview / apply summary — Apply only re-enables
  // once a fresh Preview matching the current inputs has been run.
  const resetOutcome = () => {
    setPreview(null);
    setApplyResult(null);
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    resetOutcome();
  };

  // Only touches the currently filtered/visible rows — products selected
  // earlier under a different category filter are left alone either way.
  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
    resetOutcome();
  };

  const updateControl = (patch) => {
    setControls((prev) => ({ ...prev, ...patch }));
    resetOutcome();
  };

  const columns = [
    {
      key: "select",
      label: (
        <input
          type="checkbox"
          aria-label="Select all visible products"
          checked={allVisibleSelected}
          onChange={toggleSelectAllVisible}
          className="h-4 w-4"
        />
      ),
      width: 44,
      render: (row) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.name}`}
          checked={selectedIds.has(row.id)}
          onChange={() => toggleOne(row.id)}
          className="h-4 w-4"
        />
      ),
    },
    // Pinned on scroll (see Table.jsx's `sticky` doc comment) — same
    // reasoning as ProductTable.jsx's own Name column.
    { key: "name", label: "Name", sticky: true },
    // No `as` alias on the Product<->Category association (see
    // ProductTable.jsx's own comment on this) — the default key is
    // "Category" (capitalized), not "category".
    { key: "category", label: "Category", render: (row) => row.Category?.name || "-" },
    { key: "price", label: "Current Price", render: renderPrice },
  ];

  const numValue = Number(controls.value);
  const isValueValid = Number.isFinite(numValue) && numValue > 0;

  const handlePreview = () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one product");
      return;
    }
    if (!isValueValid) {
      toast.error("Enter a valid positive value");
      return;
    }
    setApplyResult(null);
    getPricingPreview(
      { productIds: Array.from(selectedIds), direction: controls.direction, type: controls.type, value: numValue },
      setPreview,
      setIsPreviewLoading,
    );
  };

  const handleApply = () => {
    if (!preview) return;
    applyPricingUpdate(
      { productIds: Array.from(selectedIds), direction: controls.direction, type: controls.type, value: numValue },
      (result) => {
        setApplyResult(result);
        // Patch the already-loaded list in place with the new prices
        // instead of a full refetch — result.items carries every
        // requested product (excluded ones too), so only the
        // non-excluded ones actually changed.
        setProducts((prev) =>
          prev.map((p) => {
            const item = result.items.find((i) => i.productId === p.id && !i.excluded);
            if (!item) return p;
            return {
              ...p,
              variants: (p.variants || []).map((v) => {
                const updated = item.variants.find((nv) => nv.variantId === v.id);
                return updated ? { ...v, price: updated.newPrice } : v;
              }),
            };
          }),
        );
        setPreview(null);
        setSelectedIds(new Set());
      },
      setIsApplying,
    );
  };

  return (
    <div>
      <BreadCrumb title="Manage Product Pricing" items={[{ label: "Manage Product Pricing" }]} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name..."
          className="inputBox max-w-xs"
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="inputBox w-auto">
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted">
          {selectedIds.size} product{selectedIds.size === 1 ? "" : "s"} selected
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedIds(new Set());
                resetOutcome();
              }}
              className="ml-2 hover:underline"
              style={{ color: "var(--primary)" }}
            >
              Clear selection
            </button>
          )}
        </span>
      </div>

      <Table columns={columns} data={categoryFiltered} isLoading={isLoading} emptyMessage="No products found" />

      <Card className="mt-5">
        <h3 className="section-title mb-4">Adjust Pricing</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="formGroup !mb-0">
            <label className="form-label">Direction</label>
            <select
              className="inputBox w-auto"
              value={controls.direction}
              onChange={(e) => updateControl({ direction: e.target.value })}
            >
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </select>
          </div>
          <div className="formGroup !mb-0">
            <label className="form-label">Type</label>
            <select
              className="inputBox w-auto"
              value={controls.type}
              onChange={(e) => updateControl({ type: e.target.value })}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          <div className="formGroup !mb-0">
            <label className="form-label">Value</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={controls.type === "percentage" ? "e.g. 10" : "e.g. 50"}
              className="inputBox w-32"
              value={controls.value}
              onChange={(e) => updateControl({ value: e.target.value })}
            />
          </div>
          <Button type="button" variant="outline" onClick={handlePreview} disabled={isPreviewLoading}>
            {isPreviewLoading ? <LoaderSpiner size={16} /> : "Preview Changes"}
          </Button>
          <Button type="button" variant="primary" onClick={handleApply} disabled={!preview || isApplying}>
            {isApplying ? <LoaderSpiner size={16} /> : "Apply"}
          </Button>
        </div>
      </Card>

      {preview && (
        <Card className="mt-5">
          <h3 className="section-title mb-1">Preview</h3>
          <p className="mb-4 text-sm text-muted">
            {preview.summary.includedCount} of {preview.summary.totalProducts} product
            {preview.summary.totalProducts === 1 ? "" : "s"} will be updated
            {preview.summary.excludedCount > 0 &&
              ` — ${preview.summary.excludedCount} excluded (would result in an invalid price)`}
            . Total value: {formatCurrency(preview.summary.oldTotalValue)} →{" "}
            {formatCurrency(preview.summary.newTotalValue)}
          </p>

          <div className="flex flex-col gap-2">
            {preview.items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  borderColor: item.excluded ? "var(--danger)" : "var(--border)",
                  backgroundColor: item.excluded ? "rgba(179, 38, 30, 0.06)" : "transparent",
                }}
              >
                <div>
                  <p className="font-medium" style={{ color: "var(--text)" }}>
                    {item.name}
                  </p>
                  <p className="text-xs text-muted">{item.category || "-"}</p>
                </div>
                <div className="text-sm">
                  {item.variants.map((v) => (
                    <span key={v.variantId} className="mr-3">
                      {v.weight}: {formatCurrency(v.oldPrice)} → {formatCurrency(v.newPrice)}
                    </span>
                  ))}
                  {item.excluded && <span className="badge-danger mt-1 block w-fit">{item.exclusionReason}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {applyResult && (
        <Card className="mt-5">
          <h3 className="section-title mb-2">Update Applied</h3>
          <p className="text-sm" style={{ color: "var(--text)" }}>
            Updated {applyResult.updatedCount} product{applyResult.updatedCount === 1 ? "" : "s"}
            {applyResult.excludedCount > 0 && ` (${applyResult.excludedCount} excluded)`}. Total value:{" "}
            {formatCurrency(applyResult.oldTotalValue)} → {formatCurrency(applyResult.newTotalValue)}
          </p>
        </Card>
      )}
    </div>
  );
};

export default ManageProductPricing;
