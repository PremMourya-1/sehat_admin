import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getFaqData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getFaqs();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load FAQs");
  } finally {
    setIsLoading(false);
  }
}

export async function createFaq(data, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.createFaq(data);
    if (res.data.action) {
      toast.success(res.data.message || "FAQ created successfully");
      setData((prev) => [res.data.data, ...prev]);
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to create FAQ");
  } finally {
    setIsSubmitting(false);
  }
}

export async function updateFaq(id, data, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateFaq(id, data);
    if (res.data.action) {
      toast.success(res.data.message || "FAQ updated successfully");
      setData((prev) => prev.map((item) => (item.id === id ? res.data.data : item)));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update FAQ");
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteFaq(id, setData, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await adminApi.deleteFaq(id);
    if (res.data.action) {
      toast.success(res.data.message || "FAQ deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== id));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete FAQ");
  } finally {
    setIsDeleting(false);
  }
}

export async function toggleFaqStatus(id, status, setData) {
  try {
    const res = await adminApi.updateFaq(id, { status });
    if (res.data.action) {
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update status");
  }
}
