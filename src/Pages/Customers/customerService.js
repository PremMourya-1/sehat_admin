import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getCustomerData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getCustomers();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load customers");
  } finally {
    setIsLoading(false);
  }
}
