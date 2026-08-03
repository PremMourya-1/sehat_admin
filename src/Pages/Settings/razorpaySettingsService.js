import toast from "react-hot-toast";
import adminApi from "../../Service/api";

const INTEGRATION_KEY = "razorpay";

export async function getRazorpaySettings(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getIntegrationSettings(INTEGRATION_KEY);
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load Razorpay settings");
  } finally {
    setIsLoading(false);
  }
}

// Updates one mode's credentials only — never touches which mode is active.
export async function updateRazorpayModeCredentials(mode, config, setData, setIsSubmitting) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateIntegrationSettings(INTEGRATION_KEY, { mode, config });
    if (res.data.action) {
      toast.success(res.data.message || "Settings updated successfully");
      setData(res.data.data);
      return true;
    }
    toast.error(res.data.message);
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update Razorpay settings");
    return false;
  } finally {
    setIsSubmitting(false);
  }
}

// Switches which mode is live on the site — never touches credential values.
export async function switchRazorpayActiveMode(activeMode, setData, setIsSwitching) {
  try {
    setIsSwitching(true);
    const res = await adminApi.updateIntegrationSettings(INTEGRATION_KEY, { activeMode });
    if (res.data.action) {
      toast.success(`Switched to ${activeMode === "live" ? "Live" : "Test"} mode`);
      setData(res.data.data);
      return true;
    }
    toast.error(res.data.message);
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to switch mode");
    return false;
  } finally {
    setIsSwitching(false);
  }
}
