import { useState } from "react";
import { FaBars, FaUserCircle, FaFilePdf, FaCheck, FaTimes } from 'react-icons/fa';
import { LuToggleLeft, LuToggleRight } from 'react-icons/lu';

import adatech from '../assets/Polvo_AdaTech.png';
import adalove from '../assets/AdaLove.png';
import centrops from '../assets/Centro_Paula_Souza.png';

type TelaPrincipalProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

function Tela_Principal({ isDarkMode, toggleTheme }: TelaPrincipalProps) {
  const [fileName, setFileName] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setFileName(file.name);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length && files[0].type === "application/pdf") {
      setFileName(files[0].name);
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
    const fileInput = document.getElementById("pdf-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <FaBars className="icon" />
        <div className="header-actions">
          {isDarkMode ?
            <LuToggleRight className="icon toggle-icon" onClick={toggleTheme} /> :
            <LuToggleLeft className="icon toggle-icon" onClick={toggleTheme} />
          }
          <FaUserCircle className="icon" />
        </div>
      </header>

      <div className="container">
        <main className="main-content">
          <div className="welcome-section">
            <img src={adatech} alt="Logo de Polvo" className="octopus-logo" />

            <div className="content-right">
              <div className="welcome-text">
                <h1>Bem-vindo(a)!</h1>
                <p>Como posso ajudar?</p>
              </div>
              
              {!fileName ? (
                <div 
                  className="submit-document-button"
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <FaFilePdf className="pdf-icon" />
                  <span>Arraste o PDF aqui ou clique para procurar</span>
                </div>
              ) : (
                <>
                  <div className="submit-document-button-success">
                    <div className="button-content">
                      <FaFilePdf className="pdf-icon" />
                      <span>Documento enviado com sucesso!</span>
                    </div>
                    <FaCheck className="check-icon" />
                  </div>
                  <div className="uploaded-file-name">
                    <span>{fileName}</span>
                    <button onClick={handleRemoveFile} className="remove-file-button">
                      <FaTimes />
                    </button>
                  </div>
                </>
              )}
              
              {!fileName && (
                <p className="disclaimer">
                  A IA pode cometer erros. Considere verificar informações importantes.
                </p>
              )}
            </div>
          </div>
          
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          
          {fileName ? (
            <section className="data-preview-section">
              <h2>Pré-visualização dos dados:</h2>
              <form className="data-form">
                <div className="form-group">
                  <label htmlFor="manufacturer-name">Nome do Fabricante:</label>
                  <input id="manufacturer-name" type="text" className="form-input" />
                  <p className="form-note">O fabricante "ABC" será adicionado ao banco de dados!</p>
                </div>
                <div className="form-group">
                  <label htmlFor="manufacturer-address">Endereço do Fabricante:</label>
                  <input id="manufacturer-address" type="text" className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="part-number">Part-Number:</label>
                  <input id="part-number" type="text" className="form-input" />
                </div>
                <div className="form-group description-group">
                  <label htmlFor="description">Descrição:</label>
                  <textarea id="description" className="form-textarea"></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="ncm-code">Código NCM:</label>
                  <input id="ncm-code" type="text" className="form-input" />
                </div>
              </form>
              <p className="editable-note">É possível editar os campos!</p>
              <button className="export-button">
                Confirmar e exportar em formato .xlsx (Microsoft Excel)
              </button>
            </section>
          ) : (
            <section className="mission-section">
              <p>
              Minha missão é automatizar a criação da instrução de registro aduaneiro, garantindo que ela seja clara, completa e em conformidade com as exigências legais.
              </p>
              <p>Para isso, eu:</p>
              <ul>
              <li>Organizo e relaciono dados essenciais como Part-Number, NCM, fabricante e origem completa (com endereço)</li>
              <li>Gero descrições precisas dos produtos, evitando ambiguidades;</li>
              <li>Asseguro que a documentação seja compreensível para a Receita Federal, reduzindo o risco de multas ou penalidades.</li>
              </ul>
              <p>Meu objetivo é simplificar esse processo, tornando-o mais rápido, confiável e livre de erros.</p>
            </section>
          )}
        </main>
      </div>

      <footer className="app-footer">
        <img src={centrops} alt="Logo Centro Paula Souza" className="footer-logo" />
        <div className="container developed-by">
          <p>Developed by</p>
          <img src={adalove} alt="Logo AdaLove" className="dalove" />
        </div>
      </footer>
    </div>
  );
}

export default Tela_Principal;