import { useState } from "react";
import "../index.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// URL da API (ajuste se necessário)
const API_URL = "http://localhost:8000/api";

type RecuperarSenhaProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

function Recuperar_Senha({ isDarkMode, toggleTheme }: RecuperarSenhaProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Por favor, preencha o campo de e-mail!");
      return;
    }

    setIsLoading(true);

    try {
      // Endpoint que criamos no backend
      const response = await fetch(`${API_URL}/auth/password-recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao enviar e-mail de recuperação.");
      }

      toast.success("Código enviado! Verifique seu e-mail.");
      
      // NAVEGAÇÃO: Passamos o email para a próxima tela via state
      navigate("/verificacao", { state: { email: email } });

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" data-theme={isDarkMode ? "dark" : "light"}>
      <div className="bubbles">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i}></span>
        ))}
      </div>
      <header className="home-header">
        <div className="logo"><span>AdaTech</span></div>
        <label className="switch">
          <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
          <span className="slider round"></span>
        </label>
      </header>

      <div className="login-card">
        <h1>Esqueceu sua senha?</h1>
        <p className="text">
          Digite o e-mail vinculado à sua conta para receber o código.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar Código"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Recuperar_Senha;