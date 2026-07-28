import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import ProductForm from "./ProductForm";
import { createProduct } from "./productService";

const ProductAdd = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (formData) => {
    createProduct(formData, setIsSubmitting, navigate);
  };

  return (
    <div>
      <BreadCrumb
        title="Add Product"
        items={[{ label: "Products", path: "/products" }, { label: "Add Product" }]}
      />
      <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Create Product" />
    </div>
  );
};

export default ProductAdd;
