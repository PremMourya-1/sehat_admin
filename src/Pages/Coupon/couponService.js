import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getCouponData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getCoupons();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load coupons");
  } finally {
    setIsLoading(false);
  }
}

export async function createCoupon(data, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.createCoupon(data);
    if (res.data.action) {
      toast.success(res.data.message || "Coupon created successfully");
      setData((prev) => [res.data.data, ...prev]);
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to create coupon");
  } finally {
    setIsSubmitting(false);
  }
}

export async function updateCoupon(id, data, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateCoupon(id, data);
    if (res.data.action) {
      toast.success(res.data.message || "Coupon updated successfully");
      setData((prev) => prev.map((item) => (item.id === id ? res.data.data : item)));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update coupon");
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteCoupon(id, setData, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await adminApi.deleteCoupon(id);
    if (res.data.action) {
      toast.success(res.data.message || "Coupon deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== id));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete coupon");
  } finally {
    setIsDeleting(false);
  }
}
