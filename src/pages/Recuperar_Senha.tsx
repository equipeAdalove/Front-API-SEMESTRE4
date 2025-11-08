import { useState } from "react";
import "../index.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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

    setTimeout(() => {
      toast.success("Verifique seu e-mail para o código de verificação!");
      setIsLoading(false);
      navigate("/verificacao"); // Redireciona após sucesso
    }, 1500);
  };

  return (
    <div className="login-page" data-theme={isDarkMode ? "dark" : "light"}>
      <div className="bubbles">
        {Array.from({ length: 12 }).map((_, i) => (
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
        <h1>Esqueceu sua senha?</h1>
        <p className="text">
          Digite o e-mail vinculado à sua conta, e te enviaremos as instruções
          para atualização da senha!
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
            {isLoading ? "Enviando..." : "Confirmar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Recuperar_Senha;
