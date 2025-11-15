import { FaQuestionCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import octopusImage from '../assets/Polvo_AdaTech.png';

type HomeProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

function Home({ isDarkMode, toggleTheme }: HomeProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/login');
  };

  return (
    <div className={`home-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="home-header">
        <nav className="header-nav">
          <span className="logo-text">AdaTech</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleTheme}
              />
            <span className="slider round"></span>
            </label>
        </nav>
      </header>

      <main className="home-main-content">
        <div className="welcome-text">
          <h1>Bem-vindo(a) à AdaTech!</h1>
          <p>Inovação que agiliza, confiança que protege.</p>
          <button className="cta-button" onClick={handleNavigate}>
            Entrar
          </button>
        </div>
        <div className="image-container">
          <img src={octopusImage} alt="Polvo da AdaTech" className="octopus-image" />
        </div>
      </main>

      <footer className="home-footer">
        <a href="" target="_blank" rel="noopener noreferrer" className="help-link">
          <FaQuestionCircle />
          <span>Preciso de ajuda</span>
        </a>
      </footer>
    </div>
  );
}

export default Home;