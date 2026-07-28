import { Route, Routes } from "react-router-dom";
import adminRoutes from "../Data/AdminData/adminRoutesData";
import AdminLayout from "../Layout/AdminLayout/AdminLayout";
import Login from "../Pages/Auth/Login";
import Error from "../Pages/Status/Error";
import ProtectedRoute from "./ProtectedRoute";

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
      <Route path="*" element={<Error />} />
    </Routes>
  );
}

export default RouteData;
