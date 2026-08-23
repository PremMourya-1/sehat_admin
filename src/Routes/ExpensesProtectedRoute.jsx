import { Navigate } from "react-router-dom";
import { EXPENSES_TOKEN_KEY } from "../Pages/Expenses/expensesConstants";

// Deliberately separate from Routes/ProtectedRoute.jsx (admin panel auth) —
// gated on its own localStorage key (expensesToken), never ADMIN_DETAILS.
// See EXPENSES.md.
const ExpensesProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem(EXPENSES_TOKEN_KEY);
  if (!isAuthenticated) return <Navigate to="/expenses/login" replace />;
  return children;
};

export default ExpensesProtectedRoute;
