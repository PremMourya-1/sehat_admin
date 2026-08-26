import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getDashboardStats(setStats, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getDashboardStats();
    if (res.data.action) {
      setStats(res.data.data);
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load dashboard");
  } finally {
    setIsLoading(false);
  }
}

// Separate from getDashboardStats above so a slow/unreachable Shiprocket
// call never blocks the rest of the dashboard — failure here just leaves
// the wallet card in its own error state, no toast (would fire on every
// dashboard visit if Shiprocket's briefly down, which gets noisy fast).
export async function getWalletBalance(setBalance, setIsLoading, setError) {
  try {
    setIsLoading(true);
    setError(null);
    const res = await adminApi.getWalletBalance();
    if (res.data.action) {
      setBalance(res.data.data.balance);
    } else {
      setError(res.data.message || "Could not fetch wallet balance");
    }
  } catch (e) {
    setError(e?.response?.data?.message || "Could not fetch wallet balance");
  } finally {
    setIsLoading(false);
  }
}
