import toast from "react-hot-toast";
import adminApi from "../../Service/api";

// Both calls require { startDate, endDate } (YYYY-MM-DD) — the backend
// itself 400s without them (see adminSalesReportController.js
// parseRequiredDateRange), this is just where that error message surfaces
// as a toast instead of a silent failed request.
export async function getSalesByProduct(params, setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getSalesReportByProduct(params);
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load product sales report");
  } finally {
    setIsLoading(false);
  }
}

export async function getSalesByDate(params, setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getSalesReportByDate(params);
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load date-wise sales report");
  } finally {
    setIsLoading(false);
  }
}
