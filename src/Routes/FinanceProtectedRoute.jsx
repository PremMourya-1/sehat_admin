import { Navigate } from "react-router-dom";
import { FINANCE_TOKEN_KEY } from "../Pages/Finance/financeConstants";

// Deliberately separate from Routes/ProtectedRoute.jsx (admin panel auth) —
// gated on its own localStorage key (financeToken), never ADMIN_DETAILS.
// See FINANCE.md.
const FinanceProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem(FINANCE_TOKEN_KEY);
  if (!isAuthenticated) return <Navigate to="/finance/login" replace />;
  return children;
};

export default FinanceProtectedRoute;
