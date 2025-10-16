import { useState } from "react";
import adatech from "../assets/Polvo_AdaTech.png";
import Header from "../components/Header";
import Footer from "../components/Footer";
import UploadBox from "../components/UploadBox";
import ExtractionFormSection from "../components/ExtractionFormSection";
import FormSection from "../components/FormSection";
import type { ExtractedItem, ProcessedItem } from "../types";

type TelaPrincipalProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

type UIState = "initial" | "extracting" | "extracted" | "processing" | "processed" | "exporting";

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
    if (!file) return;
    setUiState("extracting");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/extract_from_pdf", {
        method: "POST",
        body: formData, // Correção do bug do FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro na extração do PDF");
      }

      const data: ExtractedItem[] = await response.json();
      setExtractedItems(data);
      setUiState("extracted");
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro desconhecido.");
      setUiState("initial");
    }
  };

  const handleProcess = async () => {
    setUiState("processing");
    setError(null);
    try {
        const response = await fetch("http://localhost:8000/api/process_items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: extractedItems }),
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
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: processedItems }),
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
    } catch (err: any) {
        setError(err.message);
    } finally {
        setUiState("processed");
    }
  };

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

  return (
    <div className="app-container">
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div className="container">
        <main className="main-content">
          <div className="welcome-section">
            <img src={adatech} alt="Logo de Polvo" className="octopus-logo" />
            <div className="content-right">
              <div className="welcome-text"><h1>Bem-vindo(a)!</h1><p>Como posso ajudar?</p></div>
              <UploadBox
                file={file}
                loading={isLoading}
                onFileSelect={(e) => { 
                  const selectedFile = e.target.files?.[0] || null;
                  setFile(selectedFile);
                  setUiState("initial");
                  setExtractedItems([]);
                  setProcessedItems([]);
                  setError(null);
                }}
                onDrop={(e) => { 
                  e.preventDefault(); 
                  const droppedFile = e.dataTransfer.files[0] || null;
                  setFile(droppedFile);
                  setUiState("initial");
                  setExtractedItems([]);
                  setProcessedItems([]);
                  setError(null);
                }}
                onRemove={resetState}
                onUpload={handleExtract}
                uploadButtonText={file ? "Extrair Dados do PDF" : "Enviar PDF"}
              />
              {error && <p className="error-message">{error}</p>}
            </div>
          </div>
          
          {uiState === "extracted" && (
            <section className="validation-section">
              <h2 className="data-preview-section-h2">Validação da Extração:</h2>
              <p className="editable-note">Verifique e corrija os Part Numbers e descrições extraídos antes de continuar.</p>
              {extractedItems.map((item, index) => (
                <ExtractionFormSection key={index} item={item} index={index} onItemChange={handleExtractedChange} />
              ))}
              {/* CORREÇÃO APLICADA AQUI */}
              <button onClick={handleProcess} disabled={isLoading} className="export-button">
                Processar Itens Corrigidos
              </button>
            </section>
          )}

          { (uiState === "processed" || uiState === "exporting") && (
            <section className="validation-section">
              <h2 className="data-preview-section-h2">Validação Final:</h2>
              {processedItems.map((item, index) => (
                <FormSection key={index} item={item} index={index} onItemChange={handleProcessedChange} />
              ))}
              <p className="editable-note">É possível editar os campos!</p>
              <button onClick={handleExport} disabled={isLoading} className="export-button">
                {uiState === 'exporting' ? "Exportando..." : "Confirmar e exportar em formato .xlsx"}
              </button>
            </section>
          )}

          {uiState === "initial" && !file && (
            <section className="mission-section">
              <p>Minha missão é automatizar...</p>
              {/* Resto do conteúdo da missão */}
            </section>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Tela_Principal;