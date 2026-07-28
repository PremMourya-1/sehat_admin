import toast from "react-hot-toast";
import adminApi from "../../Service/api";

export async function getTestimonialData(setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getTestimonials();
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load testimonials");
  } finally {
    setIsLoading(false);
  }
}

export async function createTestimonial(formData, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.createTestimonial(formData);
    if (res.data.action) {
      toast.success(res.data.message || "Testimonial created successfully");
      setData((prev) => [res.data.data, ...prev]);
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to create testimonial");
  } finally {
    setIsSubmitting(false);
  }
}

export async function updateTestimonial(id, formData, setData, setIsSubmitting, onDone) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.updateTestimonial(id, formData);
    if (res.data.action) {
      toast.success(res.data.message || "Testimonial updated successfully");
      setData((prev) => prev.map((item) => (item.id === id ? res.data.data : item)));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update testimonial");
  } finally {
    setIsSubmitting(false);
  }
}

export async function deleteTestimonial(id, setData, setIsDeleting, onDone) {
  try {
    setIsDeleting(true);
    const res = await adminApi.deleteTestimonial(id);
    if (res.data.action) {
      toast.success(res.data.message || "Testimonial deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== id));
      onDone?.();
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete testimonial");
  } finally {
    setIsDeleting(false);
  }
}

export async function toggleTestimonialStatus(id, status, setData) {
  try {
    const res = await adminApi.updateTestimonialStatus(id, status);
    if (res.data.action) {
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update status");
  }
}
