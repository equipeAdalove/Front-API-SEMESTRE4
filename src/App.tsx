import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Tela_Principal from "./pages/Tela_Principal";
import "./index.css";

function App() {

  const [paginaAtual, setPaginaAtual] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const irParaTelaPrincipal = () => {
    setPaginaAtual('principal');
  };
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <>
      {paginaAtual === 'home' ? (
        <Home 
          onNavigate={irParaTelaPrincipal}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      ) : (
        <Tela_Principal 
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      )}
    </>
  );
}

export default App;