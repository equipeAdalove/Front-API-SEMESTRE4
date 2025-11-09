import { FaBars, FaUserCircle, FaArrowLeft } from "react-icons/fa"; 
import { LuToggleLeft, LuToggleRight } from "react-icons/lu";
import "../index.css"; 
import { useNavigate, useLocation } from "react-router-dom"; 
type HeaderProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onProfileClick: () => void; 
};

function Header({ isDarkMode, toggleTheme, onProfileClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    navigate('/principal');
  };
  
  return (
    <header className="profile-header"> 
      <div className="header-left-items">
        
        <FaBars size={24} className="menu-icon" />

        {location.pathname === '/perfil' && (
          <FaArrowLeft 
            size={24} 
            className="icon back-arrow" 
            onClick={handleGoBack} 
          />
        )}
      </div>

      <div className="header-actions">
        {isDarkMode ? (
          <LuToggleRight 
            size={32} 
            className="icon toggle-icon" 
            onClick={toggleTheme} 
          />
        ) : (
          <LuToggleLeft 
            size={32} 
            className="icon toggle-icon" 
            onClick={toggleTheme} 
          />
        )}
        
        <FaUserCircle 
          size={32} 
          className="profile-icon" 
          onClick={onProfileClick} 
        />
        
      </div>
    </header>
  );
}

export default Header;