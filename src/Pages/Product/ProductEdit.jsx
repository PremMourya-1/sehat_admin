import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import ProductForm from "./ProductForm";
import { getProductById, updateProduct } from "./productService";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getProductById(id, setProduct, setIsLoading);
  }, [id]);

  const handleSubmit = (formData) => {
    updateProduct(id, formData, setIsSubmitting, navigate);
  };

  return (
    <div>
      <BreadCrumb
        title="Edit Product"
        items={[{ label: "Products", path: "/products" }, { label: "Edit Product" }]}
      />
      {isLoading ? (
        <PreLoader />
      ) : (
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Update Product"
        />
      )}
    </div>
  );
};

export default ProductEdit;
