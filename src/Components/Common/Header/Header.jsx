import { useState } from "react";
import { useSelector } from "react-redux";
import { FaBars, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useTheme } from "../../../Context/ThemeContext";
import { getLoggedInAdminDetails } from "../../../Store/Slices/AuthSlice";
import { logout } from "../../../Pages/Auth/authService";
import { cx } from "../../../Utils/utils";

const Header = () => {
  const { isSidebarCollapsed, toggleSidebar } = useTheme();
  const admin = useSelector(getLoggedInAdminDetails);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className={cx("admin-header", isSidebarCollapsed && "collapsed")}>
      <div className="flex items-center justify-between px-5 py-3.5">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
          style={{ color: "var(--text)" }}
          aria-label="Toggle sidebar"
        >
          <FaBars />
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
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border bg-white py-1 shadow-lg" style={{ borderColor: "var(--border)" }}>
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
    </header>
  );
};

export default Header;
