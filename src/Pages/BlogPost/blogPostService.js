import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getBlogPostData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getBlogPosts();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load blog posts");
  } finally {
    setIsLoading(false);
  }
}

export async function createBlogPost(formData, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.createBlogPost(formData);
    if (res.data.action) {
      toast.success(res.data.message || "Blog post created successfully");
      setData((prev) => [res.data.data, ...prev]);
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to create blog post");
  } finally {
    setIsSubmitting(false);
  }
}

export async function updateBlogPost(id, formData, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateBlogPost(id, formData);
    if (res.data.action) {
      toast.success(res.data.message || "Blog post updated successfully");
      setData((prev) => prev.map((item) => (item.id === id ? res.data.data : item)));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update blog post");
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteBlogPost(id, setData, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await adminApi.deleteBlogPost(id);
    if (res.data.action) {
      toast.success(res.data.message || "Blog post deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== id));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete blog post");
  } finally {
    setIsDeleting(false);
  }
}

export async function toggleBlogPostStatus(id, status, setData) {
  try {
    const res = await adminApi.updateBlogPostStatus(id, status);
    if (res.data.action) {
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update status");
  }
}
