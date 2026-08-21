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

export async function getOrderById(id, setData, setIsLoading) {
  try {
    setIsLoading(true);
    const res = await adminApi.getOrderById(id);
    if (res.data.action) setData(res.data.data);
    else toast.error(res.data.message);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load order");
  } finally {
    setIsLoading(false);
  }
}

// Runs the full Shiprocket order -> shipment -> AWB -> label -> pickup
// pipeline (see utils/shiprocket.js generateLabelAndFulfill). On failure the
// order's own *Status/last*Error fields (already reloaded into `data` by
// the backend even on a 400) show which step failed — but sendError()
// doesn't carry a body, so a failed attempt still needs its own refetch to
// see that; the caller's onError callback is for triggering exactly that.
export async function generateOrderLabel(id, setData, setIsGenerating, onError) {
  try {
    setIsGenerating(true);
    const res = await adminApi.generateOrderLabel(id);
    if (res.data.action) {
      toast.success(res.data.message || "Label generated successfully");
      setData(res.data.data);
      return true;
    }
    toast.error(res.data.message);
    onError?.();
    return false;
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to generate label");
    onError?.();
    return false;
  } finally {
    setIsGenerating(false);
  }
}

// Internal testing tool only (see shiprocket-configuration.md "Admin Test
// Status Simulator") — drives an order through the real
// processStatusUpdate() logic the Shiprocket webhook itself uses, so
// customerStatus/emails can be tested without a real courier. Returns the
// full result object (not just a boolean) so the caller can show whether
// the update was skipped (forward-only guard) and which email fired.
export async function simulateOrderStatus(id, status, setData, setIsSimulating) {
  try {
    setIsSimulating(true);
    const res = await adminApi.simulateOrderStatus(id, status);
    if (res.data.action) {
      const { order, skipped, reason, emailTriggered } = res.data.data;
      setData(order);
      if (skipped) {
        toast(`No change — ${reason}`);
      } else {
        toast.success(
          emailTriggered ? `Status simulated — "${emailTriggered}" email sent` : "Status simulated successfully",
        );
      }
      return { success: true, skipped, emailTriggered };
    }
    toast.error(res.data.message);
    return { success: false };
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to simulate status update");
    return { success: false };
  } finally {
    setIsSimulating(false);
  }
}

// Bulk-friendly variant of generateOrderLabel — no toast per call (the bulk
// runner shows its own progress/summary instead) and always resolves with a
// result object instead of a boolean, since a bulk run needs the per-order
// error reason, not just pass/fail.
export async function generateOrderLabelResult(id) {
  try {
    const res = await adminApi.generateOrderLabel(id);
    if (res.data.action) {
      return { success: true, order: res.data.data };
    }
    return { success: false, error: res.data.message };
  } catch (e) {
    return { success: false, error: e?.response?.data?.message || "Failed to generate label" };
  }
}

// An error response still comes back with responseType: "blob" (axios has
// no way to know the content-type differs before the request completes) —
// this reads the real { message } back out of it instead of showing a
// generic failure for something like "no orders have a generated label".
async function blobErrorMessage(blob, fallback) {
  try {
    const parsed = JSON.parse(await blob.text());
    return parsed.message || fallback;
  } catch {
    return fallback;
  }
}

// Merges every requested order's label into one PDF and triggers a browser
// download (see adminOrderController.downloadLabels). `orderIds` should
// already be filtered to labelStatus === "generated" by the caller — this
// only needs `totalSelected` (the caller's original selection size, before
// that filtering) to phrase the "X of Y" summary toast the same way whether
// the gap came from orders without a label yet, or a handful of labels that
// failed to fetch/merge server-side (rare, reported via response headers).
export async function downloadOrderLabels(orderIds, totalSelected = orderIds.length) {
  try {
    const res = await adminApi.downloadOrderLabels(orderIds);
    const merged = Number(res.headers["x-labels-merged"] ?? orderIds.length);
    const notReady = totalSelected - orderIds.length;

    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shipping-labels-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success(
      notReady > 0
        ? `Downloaded ${merged} of ${totalSelected} — ${notReady} order(s) don't have labels generated yet`
        : `Downloaded ${merged} label${merged === 1 ? "" : "s"}`,
    );
    return { success: true, merged };
  } catch (e) {
    const fallback = "Failed to download labels";
    const message =
      e?.response?.data instanceof Blob ? await blobErrorMessage(e.response.data, fallback) : e?.response?.data?.message || fallback;
    toast.error(message);
    return { success: false, error: message };
  }
}
