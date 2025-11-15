import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import "../index.css";
import { toast } from 'react-toastify';

type LoginProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const API_URL = "http://localhost:8000/api";

function Nova_Senha({ isDarkMode, toggleTheme }: LoginProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Recupera dados passados pela tela de Verificação
  const token = location.state?.token;
  const email = location.state?.email;

  useEffect(() => {
    // Segurança: Se tentar acessar essa página direto
    if (!token || !email) {
      toast.error("Sessão inválida. Faça o processo novamente.");
      navigate("/RecuperarSenha");
    }
  }, [token, email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Preencha todos os campos!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    setIsLoading(true);

    try {
      // Endpoint final de redefinição
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,      // O email do usuário
          token: token,      // O código verificado
          new_password: newPassword, // A nova senha
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao redefinir senha.");
      }

      toast.success("Senha redefinida com sucesso!");
      
      setTimeout(() => { 
          navigate('/login'); 
      }, 2000);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" data-theme={isDarkMode ? "dark" : "light"}>
      <div className="bubbles">
        {Array.from({ length: 20 }).map((_, i) => <span key={i}></span>)}
      </div>

      <header className="home-header">
        <div className="logo"><span>AdaTech</span></div>
        <label className="switch">
          <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
          <span className="slider round"></span>
        </label>
      </header>

      <div className="login-card">
        <h1>Crie sua Nova Senha</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new-password">Nova Senha:</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="confirm-password">Confirmar Senha:</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Nova Senha"}
          </button>

          <p className="signup-text">
            <Link to="/login">Cancelar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Nova_Senha;