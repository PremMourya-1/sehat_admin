import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getProductData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getProducts();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load products");
  } finally {
    setIsLoading(false);
  }
}

export async function getProductById(id, setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getProductById(id);
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load product");
  } finally {
    setIsLoading(false);
  }
}

export async function createProduct(formData, setIsSubmitting, navigate) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.createProduct(formData);
    if (res.data.action) {
      toast.success(res.data.message || "Product created successfully");
      navigate("/products");
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to create product");
  } finally {
    setIsSubmitting(false);
  }
}

export async function updateProduct(id, formData, setIsSubmitting, navigate) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateProduct(id, formData);
    if (res.data.action) {
      toast.success(res.data.message || "Product updated successfully");
      navigate("/products");
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update product");
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteProduct(id, setData, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await adminApi.deleteProduct(id);
    if (res.data.action) {
      toast.success(res.data.message || "Product deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== id));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete product");
  } finally {
    setIsDeleting(false);
  }
}
