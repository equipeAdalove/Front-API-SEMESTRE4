import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adatech from "../assets/Polvo_AdaTech.png";
import UploadBox from "../components/UploadBox";

import ExtractionFormSection from "../components/ExtractionFormSection";
import FormSection from "../components/FormSection";
import Loader from "../components/Loader";
import type { ExtractedItem, ProcessedItem } from "../types";
import { FaCheckCircle } from "react-icons/fa";

type UIState =
  | "initial"
  | "extracting"
  | "extracted"
  | "processing"
  | "processed"
  | "exporting" 
  | "downloaded";

function Tela_Principal() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  const [uiState, setUiState] = useState<UIState>("initial");
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null); 

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const isLoading =
    uiState === "extracting" ||
    uiState === "processing" ||
    uiState === "exporting"; 

  const resetState = () => {
    setFile(null);
    setUiState("initial");
    setExtractedItems([]);
    setProcessedItems([]);
    setError(null);
    setSaveMessage(null); 
    const fileInput = document.getElementById("pdf-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleExtract = async () => {
    if (!file) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Usuário não autenticado. Faça login novamente.");
      setUiState("initial"); 
      navigate("/login");
      return;
    }

    setUiState("extracting");
    setError(null);
    setSaveMessage(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/extract_from_pdf", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
            setError("Sessão expirada ou inválida. Faça login novamente.");
            localStorage.removeItem("authToken");
            navigate("/login");
            return; 
        }
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
    setSaveMessage(null); 

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Usuário não autenticado. Faça login novamente.");
      setUiState("extracted"); 
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/process_items", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ items: extractedItems }),
      });

      if (!response.ok) {
        if (response.status === 401) {
            setError("Sessão expirada ou inválida. Faça login novamente.");
            localStorage.removeItem("authToken");
            navigate("/login");
            setUiState("extracted"); 
            return; 
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro no processamento dos itens.");
      }
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

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Usuário não autenticado. Faça login novamente.");
      setUiState("processed"); 
      navigate("/login");
      return;
    }

    setUiState("exporting");
    setError(null);
    setSaveMessage(null); 
    try {
      const response = await fetch("http://localhost:8000/api/generate_excel", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ items: processedItems }),
      });

      if (!response.ok) {
          if (response.status === 401) {
            setError("Sessão expirada ou inválida. Faça login novamente.");
            localStorage.removeItem("authToken");
            navigate("/login");
            setUiState("processed"); 
            return; 
        }
        throw new Error("Erro ao gerar o arquivo Excel.");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file?.name.replace(".pdf", "")}_classificado.xlsx`;
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setUiState("downloaded");
    } catch (err: any) {
      setError(err.message);
      setUiState("processed");
    }
  };

  const handleSaveToDB = async () => {
    if (processedItems.length === 0) return;

    setUiState("exporting"); 
    setError(null);
    setSaveMessage(null);

    const token = localStorage.getItem("authToken"); 

    if (!token) {
      setError("Usuário não autenticado. Faça login novamente.");
      setUiState("processed");
      navigate("/login"); 
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/save_items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ items: processedItems }),
      });

      const responseBody = await response.text(); 
      let data;
      if (responseBody) {
          try {
              data = JSON.parse(responseBody); 
          } catch (jsonError) {
              console.error("Erro ao parsear JSON da resposta:", jsonError);
              if (!response.ok) { 
                throw new Error("Erro no servidor: Resposta inválida.");
              }
              data = { message: responseBody };
          }
      } else if (!response.ok) {
          throw new Error(`Erro no servidor: Status ${response.status}`);
      }


      if (!response.ok) {
        if (response.status === 401) {
            setError("Sessão expirada ou inválida. Faça login novamente.");
            localStorage.removeItem("authToken"); 
            navigate("/login");
        } else {
            throw new Error(data?.detail || `Erro ao salvar: Status ${response.status}`);
        }
      } else {
          setSaveMessage(data?.message || "Itens salvos com sucesso!");
          setUiState("processed");
      }

    } catch (err: any) {
      console.error("Erro na função handleSaveToDB:", err); 
      setError(err.message || "Ocorreu um erro ao tentar salvar."); 
      setUiState("processed"); 
    }
  };


  const handleExtractedChange = (
    index: number,
    field: keyof ExtractedItem,
    value: string
  ) => {
    const updated = [...extractedItems];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedItems(updated);
    setSaveMessage(null); 
  };

  const handleProcessedChange = (
    index: number,
    field: keyof ProcessedItem,
    value: any
  ) => {
    const updated = [...processedItems];
    updated[index] = { ...updated[index], [field]: value };
    setProcessedItems(updated);
    setSaveMessage(null); 
  };

  const handleViewData = () => {
    setUiState("processed");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      // Reseta o estado
      setUiState("initial");
      setExtractedItems([]);
      setProcessedItems([]);
      setError(null);
      setSaveMessage(null); 
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setUiState("initial");
      setExtractedItems([]);
      setProcessedItems([]);
      setError(null);
      setSaveMessage(null); 
    }
  };

  const handleRemoveFile = () => {
    resetState();
  };

  return (
    <div className="page-container">
      <main className="main-content">
        <div className="welcome-section">
          <img src={adatech} alt="Logo de Polvo" className="octopus-logo" />

          <div className="content-right">
            <div className="welcome-text">
              <h1>Bem-vindo(a)!</h1>
              <p>Como posso ajudar?</p>
            </div>

            {!isLoading ? (
              <UploadBox
                file={file}
                loading={false}
                downloadUrl={null}
                downloadName={""}
                onFileSelect={handleFileSelect}
                onDrop={handleDrop}
                onRemove={handleRemoveFile}
                onUpload={handleExtract}
                onDownload={() => {}}
                uploadButtonText={
                  file ? "Extrair Dados do PDF" : "Enviar PDF"
                }
                showUploadButton={uiState === "initial" && !!file}
              />
            ) : (
              <Loader />
            )}

            {error && <p className="error-message" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
            {saveMessage && !error && <p className="success-message" style={{ color: 'green', marginTop: '1rem', fontWeight: 'bold' }}>{saveMessage}</p>}


            {uiState === "initial" && !file && (
              <p className="disclaimer">
                A IA pode cometer erros. Considere verificar informações
                importantes.
              </p>
            )}
          </div>
        </div>

        {uiState === "extracted" && !isLoading && (
          <section className="validation-section">
            <h2>Validação da Extração:</h2>
            <p className="editable-note">
              Verifique e corrija os Part Numbers e descrições extraídos antes
              de continuar.
            </p>
            <div className="form-list-grid"> 
              {extractedItems.map((item, index) => (
                <ExtractionFormSection
                  key={index} 
                  item={item}
                  index={index}
                  onItemChange={handleExtractedChange}
                />
              ))}
            </div>
            <button
              onClick={handleProcess}
              disabled={isLoading}
              className="export-button" 
            >
              Processar Itens Corrigidos
            </button>
          </section>
        )}

        {uiState === "processed" && !isLoading && (
          <section className="validation-section">
            <h2>Validação Final:</h2>

            <div className="form-list-grid">
              {processedItems.map((item, index) => (
                <FormSection
                  key={index} 
                  item={item}
                  index={index}
                  onItemChange={handleProcessedChange}
                />
              ))}
            </div>
            <p className="editable-note">É possível editar os campos!</p>

            <button
              onClick={handleSaveToDB}
              disabled={isLoading}
              className="export-button save-db"
              style={{ marginRight: '1rem' }} 
            >
              Salvar Alterações no Banco
            </button>

            <button
              onClick={handleExport}
              disabled={isLoading}
              className="export-button"
            >
              Confirmar e exportar .xlsx
            </button>
          </section>
        )}

        {uiState === "downloaded" && !isLoading && (
          <section className="download-success-section" style={{ textAlign: 'center', marginTop: '2rem' }}> 
            <FaCheckCircle className="success-icon" style={{ fontSize: '3rem', color: 'green', marginBottom: '1rem' }} />
            <h2>Download concluído com sucesso!</h2>
            <button onClick={handleViewData} className="view-data-button" style={{ marginRight: '1rem' }}>
              Visualizar Dados Salvos
            </button>
            <button onClick={resetState} className="new-process-button"> 
                Iniciar Novo Processo
            </button>
          </section>
        )}


        {uiState === "initial" && !file && (
          <section className="mission-section">
            <p>
              Minha missão é automatizar a criação da instrução de registro
              aduaneiro...
            </p>
            <p>Para isso, eu:</p>
            <ul>
              <li>
                Organizo e relaciono dados essenciais...
              </li>
              <li>
                Gero descrições precisas...
              </li>
              <li>
                Asseguro que a documentação seja compreensível...
              </li>
            </ul>
            <p>
              Meu objetivo é simplificar esse processo...
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default Tela_Principal;