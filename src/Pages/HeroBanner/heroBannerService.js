import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getHeroBannerData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getHeroBanners();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load hero banners");
  } finally {
    setIsLoading(false);
  }
}

export async function createHeroBanner(formData, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.createHeroBanner(formData);
    if (res.data.action) {
      toast.success(res.data.message || "Hero banner created successfully");
      setData((prev) => [res.data.data, ...prev]);
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to create hero banner");
  } finally {
    setIsSubmitting(false);
  }
}

export async function updateHeroBanner(id, formData, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateHeroBanner(id, formData);
    if (res.data.action) {
      toast.success(res.data.message || "Hero banner updated successfully");
      setData((prev) => prev.map((item) => (item.id === id ? res.data.data : item)));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update hero banner");
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteHeroBanner(id, setData, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await adminApi.deleteHeroBanner(id);
    if (res.data.action) {
      toast.success(res.data.message || "Hero banner deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== id));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete hero banner");
  } finally {
    setIsDeleting(false);
  }
}

export async function toggleHeroBannerStatus(id, status, setData) {
  try {
    const res = await adminApi.updateHeroBannerStatus(id, status);
    if (res.data.action) {
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update status");
  }
}
