import { useState } from "react";
import { useSelector } from "react-redux";
import { FaBars, FaUserCircle, FaSignOutAlt, FaSyncAlt, FaBell, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../../Context/ThemeContext";
import { usePageData } from "../../../Context/PageDataContext";
import { useNotifications } from "../../../Context/NotificationContext";
import { getLoggedInAdminDetails } from "../../../Store/Slices/AuthSlice";
import { logout } from "../../../Pages/Auth/authService";
import { cx } from "../../../Utils/utils";

// Matches Styles/Sidebar.css's `@media (max-width: 992px)` off-canvas
// breakpoint.
const MOBILE_SIDEBAR_QUERY = "(max-width: 992px)";

const Header = () => {
  const { isSidebarCollapsed, toggleSidebar, toggleMobileSidebar, colorTheme, toggleColorTheme } = useTheme();
  const { reloadCurrentPage, isReloading } = usePageData();
  const { unreadCount, setIsDrawerOpen } = useNotifications();
  const admin = useSelector(getLoggedInAdminDetails);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  // One button, two DIFFERENT state variables depending on viewport: it
  // collapses the sidebar on desktop (>992px, where it's always visible)
  // or slides it in/out as an off-canvas panel on tablet/mobile (<=992px,
  // where it's hidden by default) — see Styles/Sidebar.css's matching
  // breakpoint. Deliberately toggles only ONE of them, decided by the
  // actual viewport at click-time, not both unconditionally — firing both
  // together (the previous behavior) let isSidebarCollapsed silently drift
  // out of sync with reality, since closeMobileSidebar (nav-link clicks,
  // the backdrop, the sidebar's own close button) only ever resets
  // isMobileSidebarOpen. That drift was the root cause of the sidebar
  // toggle feeling inconsistent — e.g. testing at desktop width, resizing
  // down, then finding the panel already open or unresponsive.
  const handleSidebarToggle = () => {
    const isMobileViewport = window.matchMedia(MOBILE_SIDEBAR_QUERY).matches;
    if (isMobileViewport) toggleMobileSidebar();
    else toggleSidebar();
  };

  return (
    <header className={cx("admin-header", isSidebarCollapsed && "collapsed")}>
      <div className="flex items-center justify-between px-5 py-3.5">
        <button
          type="button"
          onClick={handleSidebarToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
          style={{ color: "var(--text)" }}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleColorTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-base"
            style={{ color: "var(--text)" }}
            aria-label={colorTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={colorTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {colorTheme === "dark" ? <FaSun /> : <FaMoon />}
          </button>

          <button
            type="button"
            onClick={reloadCurrentPage}
            disabled={isReloading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-base"
            style={{ color: "var(--text)" }}
            aria-label="Reload current page data"
            title="Reload"
          >
            <FaSyncAlt className={isReloading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-base"
            style={{ color: "var(--text)" }}
            aria-label="Notifications"
            title="Notifications"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span
                className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
                style={{ backgroundColor: "var(--danger, #dc2626)" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium"
              style={{ color: "var(--text)" }}
            >
              <FaUserCircle className="text-2xl" style={{ color: "var(--primary)" }} />
              <span className="hidden sm:inline">{admin?.name || "Admin"}</span>
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div
                  className="absolute right-0 z-20 mt-2 w-44 rounded-lg border py-1"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", boxShadow: "var(--shadow-lg)" }}
                >
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--background-light)]"
                    style={{ color: "var(--danger)" }}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
