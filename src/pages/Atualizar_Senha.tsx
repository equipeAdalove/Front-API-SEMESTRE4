import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "../index.css";
import { toast } from 'react-toastify';

type LoginProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const API_URL = "http://localhost:8000/api";

function Atualizar_Senha({ isDarkMode, toggleTheme }: LoginProps) {
  // 1. Adicionado estado para a senha antiga
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // 2. Verifica se o usuário está logado (tem token no storage) ao invés de token de URL
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Sessão expirada. Faça login novamente.");
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valida se todos os campos (incluindo senha atual) estão preenchidos
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Preencha todos os campos!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("A nova senha e a confirmação não coincidem!");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      // 3. Endpoint ajustado para atualização de senha de usuário logado
      const response = await fetch(`${API_URL}/user/update-password`, {
        method: "PUT", 
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Envia quem é o usuário
        },
        body: JSON.stringify({
          current_password: oldPassword, // Envia a senha atual para validação
          new_password: newPassword,     // Envia a nova senha
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao atualizar senha. Verifique sua senha atual.");
      }

      toast.success("Senha atualizada! Faça login novamente.");
      
      // 4. Desloga o usuário para forçar login com a nova senha
      localStorage.removeItem("authToken");

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
        <h1>Atualizar Senha</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          
          {/* Novo campo: Senha Atual */}
          <div>
            <label htmlFor="old-password">Senha Atual:</label>
            <input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Digite sua senha atual"
            />
          </div>

          <div>
            <label htmlFor="new-password">Nova Senha:</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Digite a nova senha"
            />
          </div>

          <div>
            <label htmlFor="confirm-password">Confirmar Nova Senha:</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Confirme a nova senha"
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Nova Senha"}
          </button>

          <p className="signup-text">
            <Link to="/perfil">Cancelar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Atualizar_Senha;