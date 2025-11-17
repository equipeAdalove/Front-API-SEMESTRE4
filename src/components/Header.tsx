import { 
  FaBars, 
  FaUserCircle, 
  FaArrowLeft, 
  FaSignOutAlt 
} from "react-icons/fa"; 
import "../index.css"; 
import { useNavigate, useLocation } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext"; 

type HeaderProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onProfileClick: () => void; 
  onMenuClick: () => void; 
};

function Header({ isDarkMode, toggleTheme, onProfileClick, onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth(); 

  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <header className="profile-header"> 
      <div className="header-left-items">
        <FaBars 
          size={24} 
          className="menu-icon" 
          onClick={onMenuClick} 
          style={{ cursor: 'pointer' }}
        />

        {location.pathname === '/perfil' && (
          <FaArrowLeft 
            size={24} 
            className="icon back-arrow" 
            onClick={handleGoBack} 
          />
        )}
      </div>

      <div className="header-actions">
        <label className="switch">
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleTheme}
          />
          <span className="slider round"></span>
        </label>

        <FaUserCircle 
          size={32} 
          className="profile-icon" 
          onClick={onProfileClick} 
        />
        
        {isAuthenticated && (
          <FaSignOutAlt
            size={28}
            className="icon logout-icon"
            onClick={logout}
            style={{ cursor: 'pointer', marginLeft: '10px' }} 
          />
        )}
      </div>
    </header>
  );
}

export default Header;
