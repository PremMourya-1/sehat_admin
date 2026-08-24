import { FaSignOutAlt } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { BRAND_NAME } from "../../Constant/Constant";
import { cx } from "../../Utils/utils";
import { FINANCE_USER_KEY, addedByLabel } from "./financeConstants";
import { financeLogout } from "./financeAuthService";

const TABS = [
  { to: "/finance/expenses", label: "Expenses" },
  { to: "/finance/sales", label: "Sales" },
];

// Shared by both Expenses.jsx and Sales.jsx — one header (title + "Logged
// in as X" + Logout) plus the tab switcher between the two Finance
// resources, so neither page duplicates this and they always stay
// visually identical.
const FinanceHeader = ({ title }) => {
  const navigate = useNavigate();
  const loggedInName = localStorage.getItem(FINANCE_USER_KEY);

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="brand-logo text-3xl sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-muted">{BRAND_NAME} · Finance</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">
            Logged in as{" "}
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              {addedByLabel(loggedInName)}
            </span>
          </span>
          <button type="button" className="btn-outline" onClick={() => financeLogout(navigate)}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cx(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150",
                isActive ? "text-white" : "bg-white",
              )
            }
            style={({ isActive }) =>
              isActive
                ? { backgroundColor: "var(--primary)" }
                : { border: "1px solid var(--border)", color: "var(--text)" }
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default FinanceHeader;
