import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css';
import { toast } from 'react-toastify'

interface SignUpProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const API_URL = "http://localhost:8000/api";

const SignUp: React.FC<SignUpProps> = ({ isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError('');

    if (!fullName || !email || !password || !confirmPassword) {
      //setError('Por favor, preencha todos os campos.');
      toast.error('Por favor, preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      //setError('As senhas não coincidem.');
      toast.error('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Não foi possível criar a conta.');
      }

      console.log('Sucesso! Redirecionando para /login...');
      navigate('/login');

    } catch (err: any) {
      console.error('Erro ao tentar criar conta:', err);
      //setError(err.message || 'Ocorreu um erro ao tentar criar a conta.');
      toast.error(err.message || 'Ocorreu um erro ao tentar criar a conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container" data-theme={isDarkMode ? 'dark' : 'light'}>
      <div className="bubbles">
        {[...Array(15)].map((_, i) => <div className="bubble" key={i}></div>)}
      </div>

      <header className="signup-header">
        <h1 className="logo">AdaTech</h1>
        <label className="switch">
          <input 
            type="checkbox" 
            onChange={toggleTheme} 
            checked={isDarkMode} 
          />
          <span className="slider round"></span>
        </label>
      </header>

      <main className="signup-main">
        <div className="form-card">
          <h2>Bem-vindo(a) a AdaTech!</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Nome completo:</label>
              <input 
                type="text" 
                id="fullName" 
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="password-group">
              <div className="form-group">
                <label htmlFor="password">Insira uma senha:</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirme a senha:</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/*error && <p className="mensagem-erro">{error}</p>*/}
            
            <div className="terms-group">
              <input type="checkbox" id="terms" name="terms" required />
              <label htmlFor="terms">
                Ao criar a conta, eu aceito os <a href="#">Termos e Condições</a>, e <a href="#">Política de Privacidade</a>.
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Conta'}
            </button>
          </form>
          <p className="login-link">
            Já tem uma conta? <Link to="/login">Faça Login</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default SignUp;