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

// "Login as Customer" — opens a new tab, signed in as the target customer
// on the real storefront (see sehat-potli-front's src/auth.js
// "impersonation" provider + app/api/impersonate route). The tab is opened
// synchronously, before the token request even starts, and only navigated
// once the token comes back — opening it AFTER an await risks browsers
// (Safari especially) treating it as a blocked popup instead of a direct
// result of the admin's own click.
export async function impersonateCustomer(customerId) {
  const newTab = window.open("", "_blank");
  try {
    const res = await adminApi.impersonateCustomer(customerId);
    if (res.data.action) {
      const url = `${import.meta.env.VITE_STORE_FRONT_URL}/api/impersonate?token=${encodeURIComponent(res.data.data.token)}`;
      if (newTab) newTab.location.href = url;
      else window.open(url, "_blank");
    } else {
      toast.error(res.data.message || "Could not start impersonation session");
      newTab?.close();
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Could not start impersonation session");
    newTab?.close();
  }
}
