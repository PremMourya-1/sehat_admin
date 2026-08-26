import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getReviewData(status, setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getReviews(status);
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load reviews");
  } finally {
    setIsLoading(false);
  }
}

export async function approveReview(id, setData, setIsSubmitting) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.approveReview(id);
    if (res.data.action) {
      toast.success(res.data.message || "Review approved");
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, isApproved: true } : item)));
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to approve review");
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteReview(id, setData, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await adminApi.deleteReview(id);
    if (res.data.action) {
      toast.success(res.data.message || "Review deleted");
      setData((prev) => prev.filter((item) => item.id !== id));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete review");
  } finally {
    setIsDeleting(false);
  }
}
