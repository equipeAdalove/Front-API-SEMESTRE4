// equipeadalove/front-api-semestre4/Front-API-SEMESTRE4-main/src/components/MainLayout.tsx

import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer'; // 1. Importe o Footer

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
    // 2. Adicione a div "page-container"
    <div className="page-container"> 
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onProfileClick={goToProfile}
      />
      {/* 3. Adicione a classe "main-content" ao <main> */}
      <main className="main-content">
        <Outlet />
      </main>
      <Footer /> {/* 4. Adicione o Footer aqui */}
    </div>
  );
}

export default MainLayout;