import toast from "react-hot-toast";
import adminApi from "../../Service/api";

// GET /pricing/preview takes productIds as a query string, so it's joined
// into a comma-separated string here — the backend's parsePricingParams
// splits on comma when the value isn't already an array (query strings
// never come back as a real array unless axios's `[]`-suffix array
// serialization is relied on, which this sidesteps entirely).
export async function getPricingPreview({ productIds, direction, type, value }, setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getPricingPreview({
      productIds: productIds.join(","),
      direction,
      type,
      value,
    });
    if (res.data.action) {
      setData(res.data.data);
      return res.data.data;
    }
    toast.error(res.data.message);
    return null;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to build price preview");
    return null;
  } finally {
    setIsLoading(false);
  }
}

// POST /pricing/bulk-update — the request body is real JSON, so productIds
// travels as a genuine array. Also called directly (bypassing this
// wrapper) by the product edit page's quick-adjust widget with a
// single-item array.
export async function applyPricingUpdate({ productIds, direction, type, value }, onSuccess, setIsSubmitting) {
  try {
    setIsSubmitting(true);
    const res = await adminApi.bulkUpdatePricing({ productIds, direction, type, value });
    if (res.data.action) {
      toast.success(res.data.message || "Prices updated");
      onSuccess(res.data.data);
      return true;
    }
    toast.error(res.data.message);
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update prices");
    return false;
  } finally {
    setIsSubmitting(false);
  }
}
