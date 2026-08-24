import { Route, Routes } from "react-router-dom";
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
          routes above, not nested under ProtectedRoute/AdminLayout and not
          listed in the admin sidebar. */}
      <Route path="/finance/login" element={<FinanceLogin />} />
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
