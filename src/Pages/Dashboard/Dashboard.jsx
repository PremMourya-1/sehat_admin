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
import {
  getDashboardStats,
  getWalletBalance,
  getAnalyticsOverview,
  getAnalyticsTrends,
  getAnalyticsBreakdown,
  getBestSellers,
} from "./dashboardService";
import OverviewStats from "./OverviewStats";
import RevenueTrendChart from "./RevenueTrendChart";
import BreakdownSection from "./BreakdownSection";
import BestSellers from "./BestSellers";

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

  const [overview, setOverview] = useState(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);

  const [trendDays, setTrendDays] = useState(30);
  const [trend, setTrend] = useState([]);
  const [isTrendLoading, setIsTrendLoading] = useState(true);

  const [breakdownRange, setBreakdownRange] = useState({ range: "month" });
  const [breakdown, setBreakdown] = useState(null);
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(true);

  const [bestSellersPeriod, setBestSellersPeriod] = useState("month");
  const [bestSellersBy, setBestSellersBy] = useState("units");
  const [bestSellers, setBestSellers] = useState([]);
  const [isBestSellersLoading, setIsBestSellersLoading] = useState(true);

  // Only this one is registered with usePageReload (the header's manual
  // "reload" button) — registering more than one would just overwrite the
  // slot, since it's a single-callback ref (see Hooks/usePageReload.js).
  // Every other widget below fetches independently on mount/param-change,
  // which already covers the normal "data changed, refresh it" case.
  const fetchStats = useCallback(() => getDashboardStats(setStats, setIsLoading), []);
  usePageReload(fetchStats);

  useEffect(() => {
    getWalletBalance(setWalletBalance, setIsWalletLoading, setWalletError);
  }, []);

  useEffect(() => {
    getAnalyticsOverview(setOverview, setIsOverviewLoading);
  }, []);

  useEffect(() => {
    getAnalyticsTrends(trendDays, setTrend, setIsTrendLoading);
  }, [trendDays]);

  useEffect(() => {
    getAnalyticsBreakdown(breakdownRange, setBreakdown, setIsBreakdownLoading);
  }, [breakdownRange]);

  useEffect(() => {
    getBestSellers({ period: bestSellersPeriod, by: bestSellersBy, limit: 10 }, setBestSellers, setIsBestSellersLoading);
  }, [bestSellersPeriod, bestSellersBy]);

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
              title="Total Revenue (all-time)"
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

          <div className="mt-6">
            <OverviewStats overview={overview} isLoading={isOverviewLoading} />
          </div>

          <div className="mt-4">
            <RevenueTrendChart trend={trend} isLoading={isTrendLoading} days={trendDays} onDaysChange={setTrendDays} />
          </div>

          <div className="mt-6">
            <BreakdownSection
              range={breakdownRange}
              onRangeChange={setBreakdownRange}
              breakdown={breakdown}
              isLoading={isBreakdownLoading}
            />
          </div>

          <div className="mt-6">
            <BestSellers
              period={bestSellersPeriod}
              onPeriodChange={setBestSellersPeriod}
              by={bestSellersBy}
              onByChange={setBestSellersBy}
              products={bestSellers}
              isLoading={isBestSellersLoading}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
