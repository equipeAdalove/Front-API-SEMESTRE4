// equipeadalove/front-api-semestre4/Front-API-SEMESTRE4-main/src/components/MainLayout.tsx

import { useState } from 'react'; // ETAPA 5: Importar useState
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer'; 
import HistorySidebar from './HistorySidebar'; // ETAPA 5: Importar a Sidebar

type LayoutProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

function MainLayout({ isDarkMode, toggleTheme }: LayoutProps) {
  const navigate = useNavigate();
  
  // ETAPA 5: Estado para controlar a sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const goToProfile = () => {
    navigate('/perfil');
  };

  return (
    <div className="page-container"> 
      {/* ETAPA 5: Renderizar a Sidebar */}
      <HistorySidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
    
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onProfileClick={goToProfile}
        onMenuClick={toggleSidebar} // ETAPA 5: Passar a função para o Header
      />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer /> 
    </div>
  );
}

export default MainLayout;