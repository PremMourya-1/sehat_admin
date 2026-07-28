import { Outlet } from "react-router-dom";
import SideBar from "../../Components/Common/SideBar/SideBar";
import Header from "../../Components/Common/Header/Header";
import TpLoader from "../../Components/Common/Loader/TpLoader";
import { useTheme } from "../../Context/ThemeContext";
import { cx } from "../../Utils/utils";

const AdminLayout = () => {
  const { isSidebarCollapsed } = useTheme();

  return (
    <div>
      <TpLoader />
      <SideBar />
      <Header />
      <main className={cx("admin-content", isSidebarCollapsed && "collapsed")}>
        <div className="p-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
