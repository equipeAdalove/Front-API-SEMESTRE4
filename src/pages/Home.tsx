// src/pages/Home.tsx
import { FaGithub } from 'react-icons/fa';
import octopusImage from '../assets/Polvo_AdaTech.png';

// 1. Defina o tipo para as props
type HomeProps = {
  onNavigate: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

// 2. Aplique o tipo e use as props
function Home({ onNavigate, isDarkMode, toggleTheme }: HomeProps) {
  return (
    // Adicionada classe para estilização condicional se necessário
    <div className={`home-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="home-header">
        <nav className="header-nav">
          <span className="logo-text">AdaTech</span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={!isDarkMode} // Invertido para o switch (desligado=dark)
              onChange={toggleTheme} 
            />
            <span className="slider round"></span>
          </label>
        </nav>
      </header>

      <main className="home-main-content">
        <div className="welcome-text">
          <h1>Bem-vindo(a) a AdaTech!</h1>
          <p>Inovação que agiliza, confiança que protege.</p>
          <button className="cta-button" onClick={onNavigate}>
            Entrar
          </button>
        </div>
        <div className="image-container">
          <img src={octopusImage} alt="Polvo da AdaTech" className="octopus-image" />
        </div>
      </main>

      <footer className="home-footer">
        <a href="#" className="help-link">
          <FaGithub />
          <span>Preciso de ajuda</span>
        </a>
      </footer>
    </div>
  );
}

export default Home;