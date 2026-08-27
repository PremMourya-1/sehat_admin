import { useState } from "react";
import { NavLink } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";
import { cx } from "../../../Utils/utils";

/**
 * Sidebar nav item that owns a submenu. When the sidebar is expanded the
 * submenu expands inline; when collapsed, it flies out on hover instead
 * (handled purely in CSS via .sidebar-dropdown-menu).
 */
const SideBarDropDown = ({ item, collapsed, onNavigate }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="sidebar-dropdown">
      <div className="sidebar-link sidebar-dropdown-toggle" onClick={() => setOpen((prev) => !prev)}>
        <span className="flex items-center gap-3">
          <span className="icon">{item.icon}</span>
          <span className="label">{item.label}</span>
        </span>
        {!collapsed && (
          <MdKeyboardArrowDown className={cx("transition-transform", open && "rotate-180")} />
        )}
      </div>

      {/* Expanded state: inline collapsible submenu */}
      {!collapsed && (
        <div className={cx("sidebar-dropdown-submenu", open && "open")}>
          {item.children?.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              end
              onClick={onNavigate}
              className={({ isActive }) => cx("sidebar-link", isActive && "active")}
            >
              <span className="icon">{child.icon}</span>
              <span className="label">{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}

      {/* Collapsed state: flyout menu on hover */}
      {collapsed && (
        <div className="sidebar-dropdown-menu">
          {item.children?.map((child) => (
            <NavLink key={child.path} to={child.path} end className="sidebar-link">
              <span className="label">{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default SideBarDropDown;
