import { NavLink } from "react-router-dom";
import adminSideBarData from "../../../Data/AdminData/adminSideBarData";
import { useTheme } from "../../../Context/ThemeContext";
import { cx } from "../../../Utils/utils";
import SideBarHeader from "./SideBarHeader";
import SideBarDropDown from "./SideBarDropDown";

const SideBar = () => {
  const { isSidebarCollapsed, isMobileSidebarOpen, closeMobileSidebar } = useTheme();

  return (
    <>
      {/* Rendered whenever the mobile panel is open; CSS keeps it inert
          above the tablet breakpoint (see Styles/Sidebar.css). */}
      {isMobileSidebarOpen && <div className="sidebar-backdrop" onClick={closeMobileSidebar} />}

      <aside className={cx("sidebar", isSidebarCollapsed && "collapsed", isMobileSidebarOpen && "mobile-open")}>
        <SideBarHeader collapsed={isSidebarCollapsed} />
        <nav className="sidebar-nav">
          {adminSideBarData.map((item, index) => {
            const isNewGroup = item.group && item.group !== adminSideBarData[index - 1]?.group;
            const groupLabel = isNewGroup && (
              <div key={`group-${item.group}`} className="sidebar-group-label">
                {isSidebarCollapsed ? "•••" : item.group}
              </div>
            );

            return (
              <div key={item.path || item.label}>
                {groupLabel}
                {item.children && item.children.length > 0 ? (
                  <SideBarDropDown item={item} collapsed={isSidebarCollapsed} onNavigate={closeMobileSidebar} />
                ) : (
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    onClick={closeMobileSidebar}
                    className={({ isActive }) => cx("sidebar-link", isActive && "active")}
                  >
                    <span className="icon">{item.icon}</span>
                    <span className="label">{item.label}</span>
                  </NavLink>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default SideBar;
