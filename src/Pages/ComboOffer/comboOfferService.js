import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getComboOfferData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getComboOffers();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load combo offers");
  } finally {
    setIsLoading(false);
  }
}

export async function createComboOffer(data, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.createComboOffer(data);
    if (res.data.action) {
      toast.success(res.data.message || "Combo offer created successfully");
      setData((prev) => [res.data.data, ...prev]);
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to create combo offer");
  } finally {
    setIsSubmitting(false);
  }
}

export async function updateComboOffer(id, data, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateComboOffer(id, data);
    if (res.data.action) {
      toast.success(res.data.message || "Combo offer updated successfully");
      setData((prev) => prev.map((item) => (item.id === id ? res.data.data : item)));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update combo offer");
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteComboOffer(id, setData, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await adminApi.deleteComboOffer(id);
    if (res.data.action) {
      toast.success(res.data.message || "Combo offer deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== id));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete combo offer");
  } finally {
    setIsDeleting(false);
  }
}

export async function toggleComboOfferStatus(id, status, setData) {
  try {
    const res = await adminApi.updateComboOffer(id, { status });
    if (res.data.action) {
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update status");
  }
}
