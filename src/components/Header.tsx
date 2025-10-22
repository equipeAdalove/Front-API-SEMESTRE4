import { FaBars, FaUserCircle } from "react-icons/fa";
import { LuToggleLeft, LuToggleRight } from "react-icons/lu";
import "../index.css"; 

type HeaderProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onProfileClick: () => void; 
};

function Header({ isDarkMode, toggleTheme, onProfileClick }: HeaderProps) {
  return (
    <header className="profile-header"> 
      <FaBars size={24} className="menu-icon" />
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