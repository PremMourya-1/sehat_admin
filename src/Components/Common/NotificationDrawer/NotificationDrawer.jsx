import { Drawer } from "rsuite";
import { MdCircle } from "react-icons/md";
import { useNotifications } from "../../../Context/NotificationContext";
import PreLoader from "../Loader/PreLoader";
import { formatDate } from "../../../Utils/utils";

// Slide-in panel listing today's order notifications. Opened via the
// header's bell icon (see Header.jsx) — re-fetches on every open to merge
// in anything the socket missed while the drawer was closed.
const NotificationDrawer = () => {
  const {
    notifications,
    isLoading,
    isDrawerOpen,
    setIsDrawerOpen,
    unreadCount,
    fetchTodayNotifications,
    markAsRead,
    markAllAsRead,
    goToOrder,
  } = useNotifications();

  const handleClose = () => {
    setIsDrawerOpen(false);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markAsRead(notification.id);
    goToOrder(notification.orderId);
    setIsDrawerOpen(false);
  };

  return (
    <Drawer open={isDrawerOpen} onClose={handleClose} onOpen={fetchTodayNotifications} size="xs" placement="right">
      <Drawer.Header>
        <Drawer.Title>Today&apos;s Notifications</Drawer.Title>
        {unreadCount > 0 && (
          <Drawer.Actions>
            <button type="button" className="btn-outline !px-3 !py-1 !text-xs" onClick={markAllAsRead}>
              Mark all as read
            </button>
          </Drawer.Actions>
        )}
      </Drawer.Header>
      <Drawer.Body>
        {isLoading ? (
          <PreLoader />
        ) : notifications.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No notifications today</p>
        ) : (
          <div className="flex flex-col gap-1">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className="flex w-full items-start gap-2 rounded-lg border-b px-2 py-3 text-left"
                style={{ borderColor: "var(--border)" }}
              >
                {!notification.isRead && (
                  <span className="mt-1.5 text-[8px]" style={{ color: "var(--primary)" }}>
                    <MdCircle />
                  </span>
                )}
                <div className={notification.isRead ? "opacity-70" : ""}>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text)", fontWeight: notification.isRead ? 400 : 600 }}
                  >
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted">{notification.message}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{formatDate(notification.createdAt, "hh:mm A")}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Drawer.Body>
    </Drawer>
  );
};

export default NotificationDrawer;
