import { useCallback, useEffect, useState } from "react";
import { FaBoxOpen, FaUsers, FaRupeeSign, FaWallet } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import { HiOutlineClipboardList } from "react-icons/hi";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Card from "../../Components/Card/Card";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import { formatCurrency } from "../../Utils/utils";
import { getDashboardStats, getWalletBalance } from "./dashboardService";

// Easy to adjust later — below this, the wallet card switches to a warning
// style so the admin notices before it blocks order fulfillment (Shiprocket
// won't assign an AWB with insufficient balance).
const LOW_WALLET_BALANCE_THRESHOLD = 100;

// Deliberately not shown anywhere in the UI text — only used as the link
// target for "Add Balance" below.
const SHIPROCKET_DASHBOARD_URL = "https://app.shiprocket.in/seller/homepage";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState(null);

  const fetchStats = useCallback(() => getDashboardStats(setStats, setIsLoading), []);
  usePageReload(fetchStats);

  const fetchWalletBalance = useCallback(
    () => getWalletBalance(setWalletBalance, setIsWalletLoading, setWalletError),
    [],
  );
  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  const isLowBalance = walletBalance !== null && walletBalance < LOW_WALLET_BALANCE_THRESHOLD;

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

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-1">
            <Card
              title="Total Revenue"
              value={formatCurrency(stats?.totalRevenue)}
              icon={<FaRupeeSign />}
              accent="#C89B3C"
              className="max-w-sm"
            />

            <Card className="max-w-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted">Shiprocket Wallet</p>
                  {isWalletLoading ? (
                    <div className="mt-2">
                      <LoaderSpiner size={20} />
                    </div>
                  ) : walletError ? (
                    <p className="mt-1 text-sm text-muted">Unable to fetch balance</p>
                  ) : (
                    <h3
                      className="mt-1 text-2xl font-semibold"
                      style={{ color: isLowBalance ? "var(--danger, #dc2626)" : "var(--text)" }}
                    >
                      {formatCurrency(walletBalance)}
                    </h3>
                  )}
                  {isLowBalance && !isWalletLoading && (
                    <p className="mt-1 text-xs font-medium" style={{ color: "var(--danger, #dc2626)" }}>
                      Low balance — may block order fulfillment
                    </p>
                  )}
                </div>
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl"
                  style={{
                    backgroundColor: isLowBalance ? "#dc262622" : "var(--primary-tp)",
                    color: isLowBalance ? "#dc2626" : "var(--primary)",
                  }}
                >
                  <FaWallet />
                </div>
              </div>
              <a
                href={SHIPROCKET_DASHBOARD_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-outline mt-4 inline-block w-full text-center"
              >
                Add Balance
              </a>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
