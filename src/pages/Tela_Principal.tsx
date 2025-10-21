import { useState } from "react";
import adatech from "../assets/Polvo_AdaTech.png";
import Header from "../components/Header";
import Footer from "../components/Footer";
import UploadBox from "../components/UploadBox";
import ExtractionFormSection from "../components/ExtractionFormSection";
import FormSection from "../components/FormSection";
import Loader from "../components/Loader";
import type { ExtractedItem, ProcessedItem } from "../types";
import { FaCheckCircle } from "react-icons/fa"; // Importar ícone de sucesso

type TelaPrincipalProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

// Adicionando o novo estado
type UIState = "initial" | "extracting" | "extracted" | "processing" | "processed" | "exporting" | "downloaded";

function Tela_Principal({ isDarkMode, toggleTheme }: TelaPrincipalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uiState, setUiState] = useState<UIState>("initial");
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isLoading = uiState === "extracting" || uiState === "processing" || uiState === "exporting";

  const resetState = () => {
    setFile(null);
    setUiState("initial");
    setExtractedItems([]);
    setProcessedItems([]);
    setError(null);
    const fileInput = document.getElementById("pdf-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleExtract = async () => {
    // ... (sem alterações)
    if (!file) return;
    setUiState("extracting");
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://localhost:8000/api/extract_from_pdf", { method: "POST", body: formData });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || "Erro na extração do PDF"); }
      const data: ExtractedItem[] = await response.json();
      setExtractedItems(data);
      setUiState("extracted");
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro desconhecido.");
      setUiState("initial");
    }
  };

  const handleProcess = async () => {
    // ... (sem alterações)
    setUiState("processing");
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/process_items", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: extractedItems }),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || "Erro no processamento dos itens."); }
      const data: ProcessedItem[] = await response.json();
      setProcessedItems(data);
      setUiState("processed");
    } catch (err: any) {
      setError(err.message);
      setUiState("extracted");
    }
  };

  const handleExport = async () => {
    if (processedItems.length === 0) return;
    setUiState("exporting");
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/generate_excel", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: processedItems }),
      });
      if (!response.ok) throw new Error("Erro ao gerar o arquivo Excel.");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file?.name.replace(".pdf", "")}_classificado.xlsx`;
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      // Mudar para o estado 'downloaded' em caso de sucesso
      setUiState("downloaded");
    } catch (err: any) {
      setError(err.message);
      // Voltar para 'processed' em caso de erro na exportação
      setUiState("processed");
    }
    // Removido o 'finally' que sempre voltava para 'processed'
  };

  // Funções handleExtractedChange e handleProcessedChange (sem alterações)
  const handleExtractedChange = (index: number, field: keyof ExtractedItem, value: string) => {
    const updated = [...extractedItems];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedItems(updated);
  };

  const handleProcessedChange = (index: number, field: keyof ProcessedItem, value: any) => {
    const updated = [...processedItems];
    updated[index] = { ...updated[index], [field]: value };
    setProcessedItems(updated);
  };

  // Nova função para voltar a visualizar os dados
  const handleViewData = () => {
    setUiState("processed");
  };

  return (
    <div className="app-container">
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div className="container">
        <main className="main-content">
          <div className="welcome-section">
            <img src={adatech} alt="Logo de Polvo" className="octopus-logo" />
            <div className="content-right">
              <div className="welcome-text"><h1>Bem-vindo(a)!</h1><p>Como posso ajudar?</p></div>

              {/* UploadBox OU Loader */}
              {!isLoading ? (
                <UploadBox
                  file={file}
                  loading={false}
                  onFileSelect={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    setFile(selectedFile);
                    setUiState("initial"); setExtractedItems([]); setProcessedItems([]); setError(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedFile = e.dataTransfer.files?.[0] || null;
                    setFile(droppedFile);
                    setUiState("initial"); setExtractedItems([]); setProcessedItems([]); setError(null);
                  }}
                  onRemove={resetState}
                  onUpload={handleExtract}
                  uploadButtonText={file ? "Extrair Dados do PDF" : "Enviar PDF"}
                  // Passa a prop para esconder o botão após a extração inicial
                  showUploadButton={uiState === "initial" && !!file}
                />
              ) : ( <Loader /> )}

              {error && <p className="error-message">{error}</p>}
            </div>
          </div>

          {/* Validação da Extração */}
          {uiState === "extracted" && !isLoading && (
            <section className="validation-section">
              <h2 className="data-preview-section-h2">Validação da Extração:</h2>
              <p className="editable-note">Verifique e corrija os Part Numbers e descrições extraídos antes de continuar.</p>
              <div className="form-list-grid">
                {extractedItems.map((item, index) => (
                  <ExtractionFormSection key={index} item={item} index={index} onItemChange={handleExtractedChange} />
                ))}
              </div>
              <button onClick={handleProcess} disabled={isLoading} className="export-button">
                Processar Itens Corrigidos
              </button>
            </section>
          )}

          {/* Validação Final */}
          { uiState === "processed" && !isLoading && (
            <section className="validation-section">
              <h2 className="data-preview-section-h2">Validação Final:</h2>
              <div className="form-list-grid">
                {processedItems.map((item, index) => (
                  <FormSection key={index} item={item} index={index} onItemChange={handleProcessedChange} />
                ))}
              </div>
              <p className="editable-note">É possível editar os campos!</p>
              <button onClick={handleExport} disabled={isLoading} className="export-button">
                Confirmar e exportar em formato .xlsx
              </button>
            </section>
          )}

          {/* Nova Seção Pós-Download */}
          {uiState === "downloaded" && !isLoading && (
             <section className="download-success-section">
                <FaCheckCircle className="success-icon" />
                <h2>Download concluído com sucesso!</h2>
                <button onClick={handleViewData} className="view-data-button">
                    Visualizar Dados
                </button>
             </section>
          )}

          {/* Seção Inicial */}
          {uiState === "initial" && !file && !isLoading && (
            <section className="mission-section">
              {/* ... Conteúdo da Missão ... */}
              <p>
                Minha missão é automatizar a criação da instrução de registro aduaneiro, garantindo que ela seja clara, completa e em conformidade com as exigências legais.
              </p>
              <p>Para isso, eu:</p>
              <ul>
                <li>
                  Organizo e relaciono dados essenciais como Part-Number, NCM, fabricante e origem completa (com endereço)
                </li>
                <li>
                  Gero descrições precisas dos produtos, evitando ambiguidades;
                </li>
                <li>
                  Asseguro que a documentação seja compreensível para a Receita Federal, reduzindo o risco de multas ou penalidades.
                </li>
              </ul>
              <p>
                Meu objetivo é simplificar esse processo, tornando-o mais rápido, confiável e livre de erros.
              </p>
            </section>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Tela_Principal;