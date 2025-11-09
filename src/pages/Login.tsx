import { useState } from "react";
import { Link } from "react-router-dom";
import "../index.css";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

type LoginProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const API_URL = "http://localhost:8000/api";

function Login({ isDarkMode, toggleTheme }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Por favor, preencha todos os campos!");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "E-mail ou senha inválidos.");
      }

      if (data.data && data.data.access_token) {
        login(data.data.access_token, email);
      } else {
        throw new Error("Token de acesso não encontrado na resposta.");
      }

    } catch (err: any) {
      toast.error(err.message || "Ocorreu um erro ao tentar fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" data-theme={isDarkMode ? "dark" : "light"}>
      <div className="bubbles">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i}></span>
        ))}
      </div>

      <header className="home-header">
        <div className="logo">
          <span>AdaTech</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleTheme}
          />
          <span className="slider round"></span>
        </label>
      </header>

      <div className="login-card">
        <h1>Bem-vindo(a) de volta!</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="senha">Senha:</label>
            <input
              id="senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Link to="/recuperar_senha" className="forgot-password">
            Esqueci a senha
          </Link>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>

          <p className="signup-text">
            Novo por aqui? <Link to="/signup">Crie sua conta</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
