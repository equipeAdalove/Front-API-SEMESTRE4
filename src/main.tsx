// Arquivo: src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom'; // 1. Importe o Router

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router> {/* 2. Adicione o Router aqui, por fora de tudo */}
      <AuthProvider>
          <App />
      </AuthProvider>
    </Router> {/* 3. Feche o Router aqui */}
  </StrictMode>,
)