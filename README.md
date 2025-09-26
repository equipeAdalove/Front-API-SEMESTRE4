# **Frontend - AdaTech (React + TypeScript + Vite)**

Este projeto implementa o **frontend da aplicação AdaTech**, responsável por fornecer a interface gráfica para o usuário interagir com o backend de Classificação Fiscal.

A interface permite o **upload de arquivos PDF** contendo descrições de componentes eletrônicos, exibe os resultados processados pelo backend e possibilita o download do arquivo **Excel gerado automaticamente**.

---

## 🚀 **Funcionalidades**

* Upload de arquivos PDF pelo navegador.
* Envio dos arquivos para o backend via API REST.
* Exibição do status de processamento (loading, sucesso, erro).
* Download direto do arquivo Excel contendo os resultados processados.
* Interface moderna e responsiva construída com **React + Vite + TypeScript**.

---

## 📂 **Estrutura do Projeto**

```
frontend/
│── public/               # Arquivos estáticos
│── src/                  # Código-fonte principal
│   ├── components/       # Componentes reutilizáveis da UI
│   ├── pages/            # Páginas da aplicação
│   ├── services/         # Comunicação com a API
│   ├── App.tsx           # Componente raiz
│   └── main.tsx          # Ponto de entrada React
│── index.html            # HTML principal
│── package.json          # Dependências do projeto
│── tsconfig.json         # Configurações TypeScript
│── vite.config.ts        # Configuração do Vite
│── eslint.config.js      # Regras de linting
│── README.md             # Este arquivo
```

---

## ⚙️ **Tecnologias Utilizadas**

* **TypeScript** → fornece segurança com tipagem estática.
* **React** → biblioteca para construção de interfaces declarativas e componentizadas.
* **Vite** → ferramenta de build rápida e eficiente, com HMR (Hot Module Replacement).
* **ESLint** → garante padronização e qualidade do código.

---

## 📥 **Instalação**

1. Clone o repositório:

```bash
git clone https://github.com/equipeAdalove/Front-API-SEMESTRE4.git
cd Front-API-SEMESTRE4/frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

4. O frontend estará disponível em:

```
http://localhost:5173
```

---

## 🔗 **Integração com o Backend**

* O frontend se comunica com o backend (FastAPI) via **API REST**.
* A URL da API deve ser configurada em um arquivo de ambiente (ex: `.env` ou `config.ts`).
