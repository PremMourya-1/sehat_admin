import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getCategoryData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getCategories();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load categories");
  } finally {
    setIsLoading(false);
  }
}

export async function createCategory(formData, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.createCategory(formData);
    if (res.data.action) {
      toast.success(res.data.message || "Category created successfully");
      setData((prev) => [res.data.data, ...prev]);
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to create category");
  } finally {
    setIsSubmitting(false);
  }
}

export async function updateCategory(id, formData, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateCategory(id, formData);
    if (res.data.action) {
      toast.success(res.data.message || "Category updated successfully");
      setData((prev) => prev.map((item) => (item.id === id ? res.data.data : item)));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update category");
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteCategory(id, setData, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await adminApi.deleteCategory(id);
    if (res.data.action) {
      toast.success(res.data.message || "Category deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== id));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete category");
  } finally {
    setIsDeleting(false);
  }
}
