import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("authToken");

  if (token) {
    return <Outlet />;
  }
  
  return <Navigate to="/login" />;
};

export default ProtectedRoute;