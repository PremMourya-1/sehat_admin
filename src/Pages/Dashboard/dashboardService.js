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
