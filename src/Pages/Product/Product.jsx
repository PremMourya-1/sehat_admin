import { useCallback, useState } from "react";
import { MdAdd } from "react-icons/md";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Button from "../../Components/Button/Button";
import Table from "../../Components/Table/Table";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import UseFilter from "../../Hooks/UseFilter";
import usePageReload from "../../Hooks/usePageReload";
import useProductColumns from "./ProductTable";
import { deleteProduct, getProductData } from "./productService";

const Product = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const { search, setSearch, filteredData } = UseFilter(data, ["name"]);

  const fetchProducts = useCallback(() => getProductData(setData, setIsLoading), []);
  usePageReload(fetchProducts);

  const columns = useProductColumns({ onDelete: (row) => setToDelete(row) });

  const handleConfirmDelete = () => {
    deleteProduct(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  return (
    <div>
      <BreadCrumb title="Products" items={[{ label: "Products" }]} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name..."
          className="inputBox max-w-xs"
        />
        <Button url="/products/add" icon={<MdAdd />}>
          Add Product
        </Button>
      </div>

      <Table columns={columns} data={filteredData} isLoading={isLoading} emptyMessage="No products found" />

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
