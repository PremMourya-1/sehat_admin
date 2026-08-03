import { Outlet } from "react-router-dom";
import SideBar from "../../Components/Common/SideBar/SideBar";
import Header from "../../Components/Common/Header/Header";
import TpLoader from "../../Components/Common/Loader/TpLoader";
import NotificationDrawer from "../../Components/Common/NotificationDrawer/NotificationDrawer";
import { useTheme } from "../../Context/ThemeContext";
import { PageDataProvider } from "../../Context/PageDataContext";
import { SettingsProvider } from "../../Context/SettingsContext";
import { SocketProvider } from "../../Context/SocketContext";
import { NotificationProvider } from "../../Context/NotificationContext";
import { cx } from "../../Utils/utils";

// Settings/Socket/Notification providers live here — not in App.jsx — so
// they only ever mount once the admin is authenticated (AdminLayout is
// rendered behind ProtectedRoute), never on the /login screen.
const AdminLayout = () => {
  const { isSidebarCollapsed } = useTheme();

  return (
    <SettingsProvider>
      <SocketProvider>
        <NotificationProvider>
          <PageDataProvider>
            <div>
              <TpLoader />
              <SideBar />
              <Header />
              <NotificationDrawer />
              <main className={cx("admin-content", isSidebarCollapsed && "collapsed")}>
                <div className="p-5">
                  <Outlet />
                </div>
              </main>
            </div>
          </PageDataProvider>
        </NotificationProvider>
      </SocketProvider>
    </SettingsProvider>
  );
};

export default AdminLayout;
