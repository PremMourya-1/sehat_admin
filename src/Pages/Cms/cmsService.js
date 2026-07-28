import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getCmsData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getCmsPages();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load CMS pages");
  } finally {
    setIsLoading(false);
  }
}

export async function updateCmsPage(id, data, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateCmsPage(id, data);
    if (res.data.action) {
      toast.success(res.data.message || "Page updated successfully");
      setData((prev) => prev.map((item) => (item.id === id ? res.data.data : item)));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update page");
  } finally {
    setIsSubmitting(false);
  }
}
