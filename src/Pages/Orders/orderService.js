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
// customerStatus/notifications can be tested without a real courier.
// Returns the full result object (not just a boolean) so the caller can
// show whether the update was skipped (forward-only guard), which
// notification event fired, and — via notificationOutcome — which CHANNEL
// actually got used and whether it really succeeded. Backend awaits the
// real send for this specific caller (see adminOrderController.js
// simulateStatusUpdate's awaitNotification: true) specifically so this can
// report the truth instead of a fixed event-name label that used to read
// like "email was sent" regardless of channel or outcome (the exact
// confusion behind the 2026-08-29 phoneNumberId incident — a failed
// WhatsApp send looked identical to a successful email one).
export async function simulateOrderStatus(id, status, setData, setIsSimulating) {
  try {
    setIsSimulating(true);
    const res = await adminApi.simulateOrderStatus(id, status);
    if (res.data.action) {
      const { order, skipped, reason, notificationEvent, notificationOutcome } = res.data.data;
      setData(order);
      if (skipped) {
        toast(`No change — ${reason}`);
      } else if (notificationEvent && notificationOutcome) {
        const channelLabel = notificationOutcome.channel === "whatsapp" ? "WhatsApp" : "Email";
        if (notificationOutcome.success) {
          toast.success(`Status simulated — "${notificationEvent}" ${channelLabel} sent`);
        } else if (notificationOutcome.skipped) {
          toast.success(`Status simulated — "${notificationEvent}" ${channelLabel} already sent earlier (skipped)`);
        } else {
          toast.error(`Status simulated, but "${notificationEvent}" ${channelLabel} FAILED: ${notificationOutcome.error}`);
        }
      } else {
        toast.success("Status simulated successfully");
      }
      return { success: true, skipped, notificationEvent, notificationOutcome };
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

// Admin cancel — unlike the customer's own self-cancel (only while
// customerStatus is "confirmed"), this works at any stage; the backend
// handles cancelling the Shiprocket shipment first if one exists (see
// adminOrderController.cancelOrder) and refuses to touch the order at all
// if that fails, so a caught error here means the order is genuinely still
// active, not cancelled.
//
// `onErrorMessage`, if passed, gets the exact failure text in addition to
// the toast already fired below — used by Pages/Orders/CancelOrderModal.jsx
// (the Orders list's cancel entry point) to show the error inline in the
// modal too, since a toast alone can fade/scroll out of view before it's
// read. Optional and additive — existing callers (OrderView.jsx's own
// cancel flow) that don't pass it are unaffected.
export async function cancelOrder(id, reason, setData, setIsCancelling, onErrorMessage) {
  try {
    setIsCancelling(true);
    const res = await adminApi.cancelOrder(id, reason);
    if (res.data.action) {
      toast.success(res.data.message || "Order cancelled successfully");
      setData(res.data.data);
      return true;
    }
    toast.error(res.data.message);
    onErrorMessage?.(res.data.message || "Could not cancel this order");
    return false;
  } catch (e) {
    const message = e?.response?.data?.message || "Failed to cancel order";
    toast.error(message);
    onErrorMessage?.(message);
    return false;
  } finally {
    setIsCancelling(false);
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
