import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken')); 
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));

  const login = (jwtToken: string, email: string) => {
    localStorage.setItem('authToken', jwtToken); 
    localStorage.setItem('userEmail', email);
    setToken(jwtToken);
    setUserEmail(email);
    navigate('/principal'); 
  };


  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUserEmail(null);
    navigate('/login');
  };

  const value = {
    token,
    isAuthenticated: !!token,
    userEmail,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
