import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getSubscriberData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getNewsletterSubscribers();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load subscribers");
  } finally {
    setIsLoading(false);
  }
}

export async function deleteSubscriber(id, setData, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await adminApi.deleteNewsletterSubscriber(id);
    if (res.data.action) {
      toast.success(res.data.message || "Subscriber removed successfully");
      setData((prev) => prev.filter((item) => item.id !== id));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to remove subscriber");
  } finally {
    setIsDeleting(false);
  }
}
