import { NavLink } from "react-router-dom";
import adminSideBarData from "../../../Data/AdminData/adminSideBarData";
import { useTheme } from "../../../Context/ThemeContext";
import { cx } from "../../../Utils/utils";
import SideBarHeader from "./SideBarHeader";
import SideBarDropDown from "./SideBarDropDown";

const SideBar = () => {
  const { isSidebarCollapsed } = useTheme();

  return (
    <aside className={cx("sidebar", isSidebarCollapsed && "collapsed")}>
      <SideBarHeader collapsed={isSidebarCollapsed} />
      <nav className="sidebar-nav">
        {adminSideBarData.map((item) =>
          item.children && item.children.length > 0 ? (
            <SideBarDropDown key={item.label} item={item} collapsed={isSidebarCollapsed} />
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => cx("sidebar-link", isActive && "active")}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>
    </aside>
  );
};

export default SideBar;
