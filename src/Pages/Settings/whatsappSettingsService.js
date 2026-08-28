import toast from "react-hot-toast";
import adminApi from "../../Service/api";

const INTEGRATION_KEY = "whatsapp";

export async function getWhatsappSettings(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getIntegrationSettings(INTEGRATION_KEY);
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load WhatsApp settings");
  } finally {
    setIsLoading(false);
  }
}

export async function updateWhatsappSettings(config, setData, setIsSubmitting) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateIntegrationSettings(INTEGRATION_KEY, { config });
    if (res.data.action) {
      toast.success(res.data.message || "Settings updated successfully");
      setData(res.data.data);
      return true;
    }
    toast.error(res.data.message);
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update WhatsApp settings");
    return false;
  } finally {
    setIsSubmitting(false);
  }
}
