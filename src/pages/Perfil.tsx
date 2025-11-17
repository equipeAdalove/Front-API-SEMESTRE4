import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PrivacyModal from "../components/PrivacyModal";
import TermsModal from "../components/TermsModal";

const API_URL = "http://localhost:8000/api";

interface UserProfile {
  name: string;
  email: string;
}

function Perfil() {
  const navigate = useNavigate();
  
  // Estados de dados
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos Modais (Mantive apenas estes que são usados lá embaixo no JSX)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // --- REMOVIDO: Estados e funções duplicadas que não estavam sendo usadas nos Modais ---

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/user/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Falha ao buscar dados do perfil.");
        }

        setUserProfile(data);
      } catch (err: any) {
        setError(err.message);
        localStorage.removeItem("authToken");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  if (isLoading) return <div>Carregando perfil...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <>
      <div className="profile-content">
        <div className="welcome-banner">
          <div className="welcome-avatar"></div>
          <h2>Bem-vindo(a), {userProfile?.name}!</h2>
        </div>

        <div className="profile-card">
          <h3>Informações sobre a conta:</h3>
          <div className="info-grid">
            <span className="info-label">Nome Completo:</span>
            <span className="info-value">{userProfile?.name}</span>

            <span className="info-label">Email:</span>
            <span className="info-value">{userProfile?.email}</span>

            <span className="info-label">Senha:</span>
            <div className="info-value password-field">
              <span>**********</span>
            </div>
          </div>

          <div className="card-footer">
            <div className="footer-links">
              <a
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="disclaimer-link"
                style={{ cursor: 'pointer' }} 
              >
                Política de Privacidade
              </a>

              <a
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="disclaimer-link"
                style={{ cursor: 'pointer' }} 
              >
                Termos e Condições
              </a>
            </div>

            <button className="logout-button" onClick={handleLogout}>
              Sair da conta
            </button>
          </div>
        </div>

        <p className="profile-slogan">
          Meu objetivo é simplificar esse processo, tornando-o mais rápido, confiável e livre de erros.
        </p>
      </div>

      {/* Modais */}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </>
  );
}

export default Perfil;