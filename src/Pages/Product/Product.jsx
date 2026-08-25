import { useCallback, useEffect, useMemo, useState } from "react";
import { MdAdd, MdGridView, MdViewList } from "react-icons/md";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Button from "../../Components/Button/Button";
import Table from "../../Components/Table/Table";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import UseFilter from "../../Hooks/UseFilter";
import usePageReload from "../../Hooks/usePageReload";
import useProductColumns from "./ProductTable";
import ProductGridView from "./ProductGridView";
import { deleteProduct, getProductData } from "./productService";
import adminApi from "../../Service/api";

const Product = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  const { search, setSearch, filteredData } = UseFilter(data, ["name"]);

  const fetchProducts = useCallback(() => getProductData(setData, setIsLoading), []);
  usePageReload(fetchProducts);

  // Plain effect (not usePageReload) — same reasoning as the Combo Offer
  // builder's own product-catalog fetch: only one fetch per page can drive
  // the header's reload button, and Products' own list is this page's.
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

  const columns = useProductColumns({ onDelete: (row) => setToDelete(row) });

  const handleConfirmDelete = () => {
    deleteProduct(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  return (
    <div>
      <BreadCrumb title="Products" items={[{ label: "Products" }]} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name..."
            className="inputBox max-w-xs"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="inputBox w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border p-1" style={{ borderColor: "var(--border)" }}>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-label="Table view"
              aria-pressed={viewMode === "table"}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              style={
                viewMode === "table"
                  ? { backgroundColor: "var(--primary)", color: "#fff" }
                  : { color: "var(--text-light)" }
              }
            >
              <MdViewList size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              style={
                viewMode === "grid"
                  ? { backgroundColor: "var(--primary)", color: "#fff" }
                  : { color: "var(--text-light)" }
              }
            >
              <MdGridView size={18} />
            </button>
          </div>
          <Button url="/products/add" icon={<MdAdd />}>
            Add Product
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <Table columns={columns} data={categoryFiltered} isLoading={isLoading} emptyMessage="No products found" />
      ) : (
        <ProductGridView products={categoryFiltered} setData={setData} onDelete={(row) => setToDelete(row)} />
      )}

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete this product?"
        message={`"${toDelete?.name}" will be permanently removed.`}
      />
    </div>
  );
};

export default Product;
