// Arquivo: src/pages/Codigo_Verificacao.tsx

import { useState } from "react";
import "../index.css";
import { toast } from "react-toastify";

type CodigoVerificacaoProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const API_URL = "http://localhost:8000/api";

function Codigo_Verificacao({ isDarkMode, toggleTheme }: CodigoVerificacaoProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // foca automaticamente no próximo campo
      if (value && index < code.length - 1) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullCode = code.join("");
    if (fullCode.length < 6) {
      toast.error("Por favor, digite o código completo!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/verificar_codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: fullCode }),
      });

      if (!response.ok) {
        throw new Error("Código inválido. Tente novamente!");
      }

      toast.success("Código verificado com sucesso!");
      setCode(["", "", "", "", "", ""]);
    } catch (err: any) {
      toast.error(err.message || "Erro ao verificar o código!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="veri-page" data-theme={isDarkMode ? "dark" : "light"}>
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

      <div className="veri-card">
        <h1>Código de verificação</h1>
        <p className="text">Digite o código que enviamos para seu e-mail!</p>

        <form className="veri-form" onSubmit={handleSubmit}>
          <div className="code-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                disabled={isLoading}
                className="code-box"
              />
            ))}
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Verificando..." : "Confirmar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Codigo_Verificacao;
