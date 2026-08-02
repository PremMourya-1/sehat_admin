import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getWebSettings(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getWebSettings();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load web settings");
  } finally {
    setIsLoading(false);
  }
}

export async function updateWebSettings(patch, setData, setIsSubmitting) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateWebSettings(patch);
    if (res.data.action) {
      toast.success(res.data.message || "Settings updated successfully");
      setData(res.data.data);
      return true;
    }
    toast.error(res.data.message);
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update web settings");
    return false;
  } finally {
    setIsSubmitting(false);
  }
}
