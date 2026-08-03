import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getOrderData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getOrders();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load orders");
  } finally {
    setIsLoading(false);
  }
}

export async function updateOrderStatus(id, status, setData) {
  try {
    const res = await adminApi.updateOrderStatus(id, status);
    if (res.data.action) {
      toast.success(res.data.message || "Order status updated");
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update order status");
  }
}

export async function bulkUpdateOrderStatus(orderIds, status, setData, setIsSubmitting) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.bulkUpdateOrderStatus(orderIds, status);
    if (res.data.action) {
      toast.success(res.data.message || `${orderIds.length} order(s) updated`);
      setData((prev) => prev.map((item) => (orderIds.includes(item.id) ? { ...item, status } : item)));
      return true;
    }
    toast.error(res.data.message);
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update orders");
    return false;
  } finally {
    setIsSubmitting(false);
  }
}
