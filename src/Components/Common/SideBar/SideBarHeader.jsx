import { FiX } from "react-icons/fi";
import { BRAND_NAME } from "../../../Constant/Constant";

// `onMobileClose` renders an explicit close (X) button — CSS-only visible
// below the tablet breakpoint (see .sidebar-mobile-close in Sidebar.css).
// Needed because on mobile the open sidebar panel physically sits on top
// of the header's own hamburger button (same top-left corner, sidebar's
// z-index is higher) — without this, that corner has nothing clickable
// once the panel is open, which is exactly the "sometimes it won't close"
// bug this fixes: tapping where the hamburger used to be just hit this
// header's inert logo/brand area.
const SideBarHeader = ({ collapsed, onMobileClose }) => {
  return (
    <div className="sidebar-header">
      <span className="text-2xl">🌰</span>
      {!collapsed && <span className="brand-logo">{BRAND_NAME}</span>}
      <button
        type="button"
        onClick={onMobileClose}
        aria-label="Close menu"
        className="sidebar-mobile-close"
      >
        <FiX />
      </button>
    </div>
  );
};

export default SideBarHeader;
