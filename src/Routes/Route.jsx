import { Navigate, Route, Routes } from "react-router-dom";
import adminRoutes from "../Data/AdminData/adminRoutesData";
import AdminLayout from "../Layout/AdminLayout/AdminLayout";
import Login from "../Pages/Auth/Login";
import Error from "../Pages/Status/Error";
import ProtectedRoute from "./ProtectedRoute";
import FinanceProtectedRoute from "./FinanceProtectedRoute";
import FinanceLogin from "../Pages/Finance/FinanceLogin";
import Expenses from "../Pages/Finance/Expenses";
import Sales from "../Pages/Finance/Sales";

function RouteData() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {adminRoutes.map(({ path, element }, i) => {
          const Element = element;
          return <Route key={i + 1} path={path} element={<Element />} />;
        })}
      </Route>
      <Route path="/login" element={<Login />} />

      {/* Finance mini-app (Expenses + Sales) — a completely separate
          mini-app with its own auth (see FINANCE.md), sibling to the admin
          routes above, not nested under ProtectedRoute/AdminLayout. Linked
          from both the admin Login page and the admin sidebar (see
          Data/AdminData/adminSideBarData.jsx) even though it isn't part of
          AdminLayout — clicking through just navigates to this separate
          route tree, no full page reload. */}
      <Route path="/finance/login" element={<FinanceLogin />} />
      {/* Bare /finance defaults to Expenses so a user doesn't need to know
          the exact sub-path. */}
      <Route path="/finance" element={<Navigate to="/finance/expenses" replace />} />
      <Route
        path="/finance/expenses"
        element={
          <FinanceProtectedRoute>
            <Expenses />
          </FinanceProtectedRoute>
        }
      />
      <Route
        path="/finance/sales"
        element={
          <FinanceProtectedRoute>
            <Sales />
          </FinanceProtectedRoute>
        }
      />

      <Route path="*" element={<Error />} />
    </Routes>
  );
}

export default RouteData;
