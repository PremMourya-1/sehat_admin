import { Navigate } from "react-router-dom";
import { ADMIN_DETAILS } from "../Constant/Constant";
import { getLocaleStorageItem } from "../Utils/localeStorage";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = getLocaleStorageItem(ADMIN_DETAILS);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
