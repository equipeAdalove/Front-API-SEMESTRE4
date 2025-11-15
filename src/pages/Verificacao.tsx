import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Recupera o email passado pela tela anterior
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.warn("E-mail não identificado. Voltando...");
      navigate("/RecuperarSenha");
    }
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

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
      toast.error("Digite o código completo!");
      return;
    }

    setIsLoading(true);

    try {
      // Endpoint de verificação do backend
      const response = await fetch(`${API_URL}/auth/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            email: email,
            token: fullCode 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Código inválido ou expirado.");
      }

      toast.success("Código validado com sucesso!");
      
      // NAVEGAÇÃO: Passa o token validado e o email para a tela de nova senha
      navigate("/NovaSenha", { 
        state: { 
            token: fullCode, // Passamos o código que foi validado
            email: email 
        } 
      });

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="veri-page" data-theme={isDarkMode ? "dark" : "light"}>
        <div className="bubbles">
         {Array.from({ length: 12 }).map((_, i) => <span key={i}></span>)}
       </div>
      <header className="home-header">
        <div className="logo"><span>AdaTech</span></div>
        <label className="switch">
          <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
          <span className="slider round"></span>
        </label>
      </header>

      <div className="veri-card">
        <h1>Código de verificação</h1>
        <p className="text">
            Digite o código enviado para <strong>{email}</strong>
        </p>

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