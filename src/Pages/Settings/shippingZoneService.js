import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getShippingZoneData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getShippingZones();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load shipping zones");
  } finally {
    setIsLoading(false);
  }
}

export async function createShippingZone(payload, setData, setIsSubmitting, onSuccess) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.createShippingZone(payload);
    if (res.data.action) {
      toast.success(res.data.message || "Shipping zone created");
      setData((prev) => [...prev, res.data.data]);
      onSuccess?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to create shipping zone");
  } finally {
    setIsSubmitting(false);
  }
}

export async function updateShippingZone(id, payload, setData, setIsSubmitting, onSuccess) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateShippingZone(id, payload);
    if (res.data.action) {
      toast.success(res.data.message || "Shipping zone updated");
      setData((prev) => prev.map((zone) => (zone.id === id ? res.data.data : zone)));
      onSuccess?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update shipping zone");
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteShippingZone(id, setData, setIsDeleting, onSuccess) {
  try {
    setIsDeleting(true);
    const res = await adminApi.deleteShippingZone(id);
    if (res.data.action) {
      toast.success(res.data.message || "Shipping zone deleted");
      setData((prev) => prev.filter((zone) => zone.id !== id));
      onSuccess?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete shipping zone");
  } finally {
    setIsDeleting(false);
  }
}
