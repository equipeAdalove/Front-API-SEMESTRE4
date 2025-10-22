import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';

type LayoutProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

function MainLayout({ isDarkMode, toggleTheme }: LayoutProps) {
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate('/perfil');
  };

  return (
    <>
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onProfileClick={goToProfile}
      />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;