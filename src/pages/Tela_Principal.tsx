import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import adatech from "../assets/Polvo_AdaTech.png";
import UploadBox from "../components/UploadBox";
import { toast } from 'react-toastify';

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
  
const fetchAPI = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("authToken");
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem("authToken");
    window.location.href = '/login'; 
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  
  return response;
};


function Tela_Principal() {
  const navigate = useNavigate();
  const { transacaoId } = useParams<{ transacaoId?: string }>();

  const [file, setFile] = useState<File | null>(null);
  const [currentTransactionId, setCurrentTransactionId] = useState<number | null>(null);

  const [uiState, setUiState] = useState<UIState>("initial");
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const [error, setError] = useState<string | null>(null); 
  const [saveMessage, setSaveMessage] = useState<string | null>(null); 

  useEffect(() => {
    if (transacaoId) {
      const loadTransaction = async () => {
        setUiState("processing"); 
        setError(null);
        setProcessedItems([]);
        
        try {
          const response = await fetchAPI(`http://localhost:8000/api/transacao/${transacaoId}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Erro ao carregar histórico.");
          }

          const data = await response.json(); 
          
          if (data.processed_items && data.processed_items.length > 0) {
             setProcessedItems(data.processed_items);
             setUiState("processed");
          } else if (data.pending_items && data.pending_items.length > 0) {
             setExtractedItems(data.pending_items);
             setUiState("extracted");
          } else {
             toast.info("Esta transação não possui itens.");
             setUiState("initial");
          }

          setCurrentTransactionId(data.transacao_id);
          setFile(null); 
          
        } catch (err: any) {
          toast.error(err.message);
          navigate("/principal"); 
        }
      };
      
      loadTransaction();
    } else {
      resetState();
    }
  }, [transacaoId, navigate]);


  const isLoading =
    uiState === "extracting" ||
    uiState === "processing" ||
    uiState === "exporting"; 

  const resetState = () => {
    setFile(null);
    setCurrentTransactionId(null); 
    setUiState("initial");
    setExtractedItems([]);
    setProcessedItems([]);
    setError(null);
    setSaveMessage(null); 
    const fileInput = document.getElementById("pdf-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    
    if (transacaoId) {
      navigate("/principal");
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setUiState("extracting");
    setError(null);
    setSaveMessage(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetchAPI("http://localhost:8000/api/extract_from_pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro na extração do PDF");
      }
      
      const data = await response.json(); 
      
      setExtractedItems(data.items);
      setCurrentTransactionId(data.transacao_id); 
      setUiState("extracted");

    } catch (err: any) {
      toast.error(err.message || "Ocorreu um erro desconhecido.");
      setError(err.message) 
      setUiState("initial");
    }
  };

  const handleProcess = async () => {
    if (!currentTransactionId) {
      toast.error("Erro: ID da transação não encontrado.");
      return;
    }

    setUiState("processing");
    setError(null);
    setSaveMessage(null); 

    try {
      const response = await fetchAPI(`http://localhost:8000/api/process_items/${currentTransactionId}`, {
        method: "POST",
        body: JSON.stringify({ items: extractedItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro no processamento dos itens.");
      }
      
      const data: ProcessedItem[] = await response.json();
      setProcessedItems(data);
      setUiState("processed");
    } catch (err: any) {
      toast.error(err.message || "Erro no processamento.");
      setError(err.message);
      setUiState("extracted");
    }
  };

  const handleSaveAndExport = async () => {
    if (processedItems.length === 0) {
      toast.warn("Não há itens processados para salvar ou exportar.");
      return;
    }
    if (!currentTransactionId) {
      toast.error("Erro: ID da transação não encontrado.");
      return;
    }

    setUiState("exporting"); 
    setError(null);
    setSaveMessage(null);

    try {
      const saveResponse = await fetchAPI(`http://localhost:8000/api/update_transaction/${currentTransactionId}`, {
        method: "PUT", 
        body: JSON.stringify({ items: processedItems }),
      });

      const responseBody = await saveResponse.text(); 
      let data;
      if (responseBody) {
          try {
              data = JSON.parse(responseBody); 
          } catch (jsonError) {
              console.error("Erro ao parsear JSON do salvamento:", jsonError);
              if (!saveResponse.ok) { 
                throw new Error("Erro no servidor: Resposta inválida ao salvar.");
              }
              data = { message: responseBody };
          }
      } else if (!saveResponse.ok) {
          throw new Error(`Erro no servidor: Status ${saveResponse.status}`);
      }

      if (!saveResponse.ok) {
        throw new Error(data?.detail || `Erro ao salvar: Status ${saveResponse.status}`);
      }
      
      toast.success(data?.message || "Alterações salvas com sucesso!"); 
      
      const exportResponse = await fetchAPI("http://localhost:8000/api/generate_excel", {
        method: "POST",
        body: JSON.stringify({ items: processedItems }),
      });

      if (!exportResponse.ok) {
        const errorData = await exportResponse.json();
        throw new Error(errorData.detail || "Erro ao gerar o arquivo Excel (mas os dados foram salvos).");
      }
      
      const blob = await exportResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file?.name.replace(".pdf", "") || 'processo'}_classificado.xlsx`;
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setUiState("downloaded");

    } catch (err: any) {
      console.error("Erro em handleSaveAndExport:", err); 
      toast.error(err.message || "Ocorreu um erro ao salvar ou exportar.");
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
      setUiState("initial");
      setCurrentTransactionId(null);
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
      setCurrentTransactionId(null);
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

            {!transacaoId && uiState === "initial" && !isLoading && (
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
            )}
            
            {!transacaoId && (uiState === 'extracting' || uiState === 'processing') && (
              <Loader />
            )}

            {transacaoId && isLoading && (
              <Loader />
            )}

            {saveMessage && !error && <p className="success-message" style={{ color: 'green', marginTop: '1rem', fontWeight: 'bold' }}>{saveMessage}</p>}

            {uiState === "initial" && !file && !transacaoId && (
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
            {transacaoId ? (
              <h2>Visualizando Histórico:</h2>
            ) : (
              <h2>Validação Final:</h2>
            )}
            
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

            <div className="form-action-buttons">
              <button
                onClick={handleSaveAndExport}
                disabled={isLoading}
                className="export-button"
              >
                Salvar e Exportar .xlsx
              </button>

              <button
                onClick={resetState}
                disabled={isLoading}
                className="export-button save-db" 
              >
                Finalizar Processo
              </button>
            </div>
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

        {uiState === "initial" && !file && !transacaoId && (
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
  );
}

export default Tela_Principal;