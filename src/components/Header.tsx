import { FaBars, FaUserCircle } from "react-icons/fa";
import { LuToggleLeft, LuToggleRight } from "react-icons/lu";

type HeaderProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

function Header({ isDarkMode, toggleTheme }: HeaderProps) {
  return (
    <header className="app-header">
      <FaBars className="icon" />
      <div className="header-actions">
        {isDarkMode ? (
          <LuToggleRight className="icon toggle-icon" onClick={toggleTheme} />
        ) : (
          <LuToggleLeft className="icon toggle-icon" onClick={toggleTheme} />
        )}
        <FaUserCircle className="icon" />
      </div>
    </header>
  );
}

export default Header;
