import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getCartRewardData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getCartRewards();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load cart reward tiers");
  } finally {
    setIsLoading(false);
  }
}

export async function createCartReward(data, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.createCartReward(data);
    if (res.data.action) {
      toast.success(res.data.message || "Cart reward tier created successfully");
      setData((prev) => [...prev, res.data.data]);
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to create cart reward tier");
  } finally {
    setIsSubmitting(false);
  }
}

export async function updateCartReward(id, data, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateCartReward(id, data);
    if (res.data.action) {
      toast.success(res.data.message || "Cart reward tier updated successfully");
      setData((prev) => prev.map((item) => (item.id === id ? res.data.data : item)));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update cart reward tier");
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteCartReward(id, setData, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await adminApi.deleteCartReward(id);
    if (res.data.action) {
      toast.success(res.data.message || "Cart reward tier deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== id));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete cart reward tier");
  } finally {
    setIsDeleting(false);
  }
}

export async function toggleCartRewardStatus(id, status, setData) {
  try {
    const res = await adminApi.updateCartReward(id, { status });
    if (res.data.action) {
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update status");
  }
}
