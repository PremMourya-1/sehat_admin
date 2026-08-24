import toast from "react-hot-toast";
import financeApi from "../../Service/financeApi";

// GET — server does the filtering/sorting/totaling (see
// controllers/salesController.js), so this always replaces the whole
// { sales, total, count } state rather than patching it locally.
export async function getSalesData(filters, setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await financeApi.getSales(filters);
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load sales");
  } finally {
    setIsLoading(false);
  }
}

export async function createSale(data, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await financeApi.createSale(data);
    if (res.data.action) {
      toast.success(res.data.message || "Sale added successfully");
      onDone?.();
      return true;
    }
    toast.error(res.data.message);
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to add sale");
    return false;
  } finally {
    setIsSubmitting(false);
  }
}

export async function updateSale(id, data, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await financeApi.updateSale(id, data);
    if (res.data.action) {
      toast.success(res.data.message || "Sale updated successfully");
      onDone?.();
      return true;
    }
    toast.error(res.data.message);
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update sale");
    return false;
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteSale(id, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await financeApi.deleteSale(id);
    if (res.data.action) {
      toast.success(res.data.message || "Sale deleted successfully");
      onDone?.();
      return true;
    }
    toast.error(res.data.message);
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete sale");
    return false;
  } finally {
    setIsDeleting(false);
  }
}
