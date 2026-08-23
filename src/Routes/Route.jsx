import { Route, Routes } from "react-router-dom";
import adminRoutes from "../Data/AdminData/adminRoutesData";
import AdminLayout from "../Layout/AdminLayout/AdminLayout";
import Login from "../Pages/Auth/Login";
import Error from "../Pages/Status/Error";
import ProtectedRoute from "./ProtectedRoute";
import ExpensesProtectedRoute from "./ExpensesProtectedRoute";
import ExpensesLogin from "../Pages/Expenses/ExpensesLogin";
import Expenses from "../Pages/Expenses/Expenses";

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

      {/* Expenses Tracker — a completely separate mini-app with its own
          auth (see EXPENSES.md), sibling to the admin routes above, not
          nested under ProtectedRoute/AdminLayout and not listed in the
          admin sidebar. */}
      <Route path="/expenses/login" element={<ExpensesLogin />} />
      <Route
        path="/expenses"
        element={
          <ExpensesProtectedRoute>
            <Expenses />
          </ExpensesProtectedRoute>
        }
      />

      <Route path="*" element={<Error />} />
    </Routes>
  );
}

export default RouteData;
