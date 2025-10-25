// Arquivo: src/App.tsx

import { useState, useEffect } from "react";
// 1. Remova 'BrowserRouter as Router' da importação
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Tela_Principal from "./pages/Tela_Principal";
import Perfil from "./pages/Perfil";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute"; 

import "./index.css";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    // 2. Remova o componente <Router> que envolvia as rotas
    <Routes>
      <Route
        path="/"
        element={<Home isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
      />
      <Route
        path="/login"
        element={<Login isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
      />
      <Route 
        path="/signup" 
        element={<SignUp isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} 
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}>
          <Route path="/principal" element={<Tela_Principal />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Route>
    </Routes>
    // 3. Remova o fechamento do </Router>
  );
}

export default App;