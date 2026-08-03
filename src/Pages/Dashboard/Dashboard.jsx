import { useCallback, useState } from "react";
import { FaBoxOpen, FaUsers, FaRupeeSign } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import { HiOutlineClipboardList } from "react-icons/hi";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Card from "../../Components/Card/Card";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import usePageReload from "../../Hooks/usePageReload";
import { formatCurrency } from "../../Utils/utils";
import { getDashboardStats } from "./dashboardService";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(() => getDashboardStats(setStats, setIsLoading), []);
  usePageReload(fetchStats);

  const cards = [
    {
      title: "Total Products",
      value: stats?.totalProducts ?? 0,
      icon: <FaBoxOpen />,
      accent: "#2E4A3B",
    },
    {
      title: "Total Categories",
      value: stats?.totalCategories ?? 0,
      icon: <BiCategory />,
      accent: "#C89B3C",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: <HiOutlineClipboardList />,
      accent: "#6B1F2A",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      icon: <FaUsers />,
      accent: "#5C4033",
    },
  ];

  return (
    <div>
      <BreadCrumb title="Dashboard" items={[{ label: "Dashboard" }]} />

      {isLoading ? (
        <PreLoader />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 lg:grid-cols-2 xs:grid-cols-1">
            {cards.map((card) => (
              <Card key={card.title} title={card.title} value={card.value} icon={card.icon} accent={card.accent} />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1">
            <Card
              title="Total Revenue"
              value={formatCurrency(stats?.totalRevenue)}
              icon={<FaRupeeSign />}
              accent="#C89B3C"
              className="max-w-sm"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
