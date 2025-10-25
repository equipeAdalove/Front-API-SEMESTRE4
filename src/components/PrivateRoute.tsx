import { type ReactNode } from 'react'; 
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

interface PrivateRouteProps {
  children: ReactNode; 
}

const PrivateRoute = ({ children }: PrivateRouteProps) => { 
  const { isAuthenticated } = useAuth(); 

  if (!isAuthenticated) {
    return <Navigate to="/" replace={true} />; 
  }

  return <>{children}</>;
};

export default PrivateRoute;