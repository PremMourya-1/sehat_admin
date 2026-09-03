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

// Sends one of the 4 order-status templates, with dummy placeholder data,
// straight to `phoneNumber` — for the "Send Test Message" panel on Settings
// > Notifications. Unlike every other service function on this page, the
// failure branch here does NOT toast a generic message — it returns the
// real Meta error text (unapproved template, bad phone number ID, missing
// send permission, etc.) so the caller can show the admin exactly why a
// real order's message would also fail.
export async function sendTestWhatsappMessage(phoneNumber, event, setIsSending) {
  try {
    setIsSending(true);
    const res = await adminApi.sendTestWhatsappTemplate({ phoneNumber, event });
    if (res.data.action) return { success: true, message: res.data.message };
    return { success: false, error: res.data.message || "Test message failed to send" };
  } catch (e) {
    return { success: false, error: e?.response?.data?.message || "Test message failed to send" };
  } finally {
    setIsSending(false);
  }
}
