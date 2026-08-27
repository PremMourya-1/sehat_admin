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

// The always-on today/week/month header stats — not affected by the
// breakdown section's date-range filter.
export async function getAnalyticsOverview(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getAnalyticsOverview();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load analytics overview");
  } finally {
    setIsLoading(false);
  }
}

export async function getAnalyticsTrends(days, setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getAnalyticsTrends(days);
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load revenue trend");
  } finally {
    setIsLoading(false);
  }
}

// range: { range: "today"|"week"|"month"|"custom", from?, to? }
export async function getAnalyticsBreakdown(range, setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getAnalyticsBreakdown(range);
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load breakdown");
  } finally {
    setIsLoading(false);
  }
}

export async function getBestSellers(params, setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getBestSellers(params);
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load best sellers");
  } finally {
    setIsLoading(false);
  }
}
