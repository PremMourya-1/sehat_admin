import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdShoppingBag } from "react-icons/md";
import adminApi from "../Service/api";
import { useSocket } from "./SocketContext";
import { useSettings } from "./SettingsContext";

const NotificationContext = createContext(null);

const hasBrowserNotifications = typeof window !== "undefined" && "Notification" in window;

// The in-app bell/drawer notification below is always on — settings.notifications
// only gates the three *extra* delivery channels layered on top of it (Part 3).
export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [browserPermission, setBrowserPermission] = useState(
    hasBrowserNotifications ? Notification.permission : "unsupported",
  );

  // Read via a ref inside the socket handler so the listener doesn't need to
  // be torn down/re-attached every time a settings toggle changes.
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const mergeNotifications = useCallback((incoming) => {
    if (!incoming || incoming.length === 0) return;
    setNotifications((prev) => {
      const byId = new Map(prev.map((n) => [n.id, n]));
      incoming.forEach((n) => byId.set(n.id, n));
      return Array.from(byId.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });
  }, []);

  const fetchTodayNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getNotifications({ date: "today" });
      if (res.data.action) mergeNotifications(res.data.data);
    } finally {
      setIsLoading(false);
    }
  }, [mergeNotifications]);

  // Seeds the bell's unread count on load/refresh — the drawer re-fetches
  // again on open, per the spec, to merge in anything missed while closed.
  useEffect(() => {
    fetchTodayNotifications();
  }, [fetchTodayNotifications]);

  // Chrome only ever prompts once per origin — requesting again after a
  // "default" (not yet decided) state is a no-op from the browser's side,
  // and we never re-prompt once the admin has granted/denied it.
  useEffect(() => {
    if (!hasBrowserNotifications) return;
    if (!settings?.notifications?.chromePushEnabled) return;
    if (Notification.permission !== "default") return;
    Notification.requestPermission().then(setBrowserPermission);
  }, [settings?.notifications?.chromePushEnabled]);

  const goToOrder = useCallback(
    (orderId) => {
      if (orderId) navigate(`/orders`);
    },
    [navigate],
  );

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = ({ notification, order }) => {
      mergeNotifications([notification]);
      const currentSettings = settingsRef.current;
      const channels = currentSettings?.notifications || {};

      if (channels.toastPopupEnabled) {
        toast.custom(
          (t) => (
            <div
              onClick={() => {
                toast.dismiss(t.id);
                goToOrder(order.id);
              }}
              className="flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-lg"
              style={{ borderColor: "var(--border)", opacity: t.visible ? 1 : 0 }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: "var(--primary-tp)", color: "var(--primary)" }}
              >
                <MdShoppingBag />
              </span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  New Order — {order.orderNumber}
                </p>
                <p className="text-xs text-muted">₹{order.total} · {order.paymentMethod}</p>
              </div>
            </div>
          ),
          { duration: 5000 },
        );
      }

      if (channels.soundEnabled) {
        new Audio("/sounds/notification.wav").play().catch(() => {});
      }

      if (channels.chromePushEnabled && hasBrowserNotifications && Notification.permission === "granted") {
        const browserNotification = new Notification("New Order Received", {
          body: `Order ${order.orderNumber} · ₹${order.total}`,
        });
        browserNotification.onclick = () => {
          window.focus();
          goToOrder(order.id);
        };
      }
    };

    socket.on("new-order", handleNewOrder);
    return () => socket.off("new-order", handleNewOrder);
  }, [socket, mergeNotifications, goToOrder]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await adminApi.markNotificationRead(id);
    } catch {
      // Optimistic update stands even if the network call fails silently —
      // the next fetch (drawer reopen) will reconcile from the server.
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await adminApi.markAllNotificationsRead();
    } catch {
      // See markAsRead — reconciled on next fetch either way.
    }
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      isDrawerOpen,
      setIsDrawerOpen,
      browserPermission,
      fetchTodayNotifications,
      markAsRead,
      markAllAsRead,
      goToOrder,
    }),
    [notifications, unreadCount, isLoading, isDrawerOpen, browserPermission, fetchTodayNotifications, markAsRead, markAllAsRead, goToOrder],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationProvider");
  return ctx;
};

export default NotificationContext;
