// Arquivo: src/App.tsx

import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
// 1. Importa o react-toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Tela_Principal from "./pages/Tela_Principal";
import Perfil from "./pages/Perfil";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RecuperarSenha from "./pages/Recuperar_Senha";
import Verificacao from "./pages/Verificacao";

import "./index.css";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <>
      {/* 3. Adiciona o ToastContainer aqui */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"} // Vincula ao tema do app
      />

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
        <Route
          path="/recuperar_senha"
          element={
            <RecuperarSenha
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/verificacao"
          element={
            <Verificacao
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <MainLayout
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
              />
            }
          >
            <Route path="/principal" element={<Tela_Principal />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
