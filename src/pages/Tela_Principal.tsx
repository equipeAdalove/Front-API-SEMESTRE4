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
        try {
          const response = await fetchAPI(`http://localhost:8000/api/transacao/${transacaoId}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Erro ao carregar histórico.");
          }

          const data = await response.json(); 
          
          setProcessedItems(data.items);
          setCurrentTransactionId(data.transacao_id);
          setFile(null); 
          setUiState("processed"); 
          
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

  const handleExport = async () => {
    if (processedItems.length === 0) return;

    setUiState("exporting");
    setError(null);
    setSaveMessage(null); 
    try {
      const response = await fetchAPI("http://localhost:8000/api/generate_excel", {
        method: "POST",
        body: JSON.stringify({ items: processedItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao gerar o arquivo Excel.");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file?.name.replace(".pdf", "") || 'processo'}_classificado.xlsx`;
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setUiState("downloaded");
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar Excel.");
      setError(err.message);
      setUiState("processed");
    }
  };

  const handleSaveToDB = async () => {
    if (processedItems.length === 0) return;
    
    if (!currentTransactionId) {
      toast.error("Erro: ID da transação não encontrado para salvar.");
      return;
    }

    setUiState("exporting"); 
    setError(null);
    setSaveMessage(null);

    try {
      const response = await fetchAPI(`http://localhost:8000/api/update_transaction/${currentTransactionId}`, {
        method: "PUT", 
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
         throw new Error(data?.detail || `Erro ao salvar: Status ${response.status}`);
      } else {
          toast.success(data?.message || "Itens salvos com sucesso!"); 
          setUiState("processed"); 
      }

    } catch (err: any) {
      console.error("Erro na função handleSaveToDB:", err); 
      toast.error(err.message || "Ocorreu um erro ao tentar salvar.");
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
        
        {/* --- CORREÇÃO (Pedido 2): 'welcome-section' é sempre visível --- */}
        <div className="welcome-section">
          <img src={adatech} alt="Logo de Polvo" className="octopus-logo" />

          <div className="content-right">
            <div className="welcome-text">
              <h1>Bem-vindo(a)!</h1>
              <p>Como posso ajudar?</p>
            </div>

            {/* Mostra a caixa de upload APENAS se não houver ID de transação */}
            {!transacaoId && !isLoading && (
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
            
            {/* Mostra o loader de upload/extração (só se !transacaoId) */}
            {isLoading && !transacaoId && (
              <Loader />
            )}

            {/* Mostra o loader de carregamento de histórico (só se transacaoId) */}
            {isLoading && transacaoId && (
              <Loader />
            )}

            {saveMessage && !error && <p className="success-message" style={{ color: 'green', marginTop: '1rem', fontWeight: 'bold' }}>{saveMessage}</p>}

            {/* Oculta disclaimer se estiver no histórico */}
            {uiState === "initial" && !file && !transacaoId && (
              <p className="disclaimer">
                A IA pode cometer erros. Considere verificar informações
                importantes.
              </p>
            )}
          </div>
        </div>
        {/* --- FIM DA CORREÇÃO --- */}


        {uiState === "extracted" && !isLoading && (
          <section className="validation-section">
            <h2>Validação da Extração:</h2>
            <p className="editable-note">
              Verifique e corrija os Part Numbers e descrições extraídos antes
              de continuar.
            </p>
            {/* --- CORREÇÃO (Pedido 2): Adiciona a div 'form-list-grid' --- */}
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
            {/* Adiciona título APENAS se for um item do histórico */}
            {transacaoId && (
              <h2>Visualizando Histórico:</h2>
            )}
            {!transacaoId && (
              <h2>Validação Final:</h2>
            )}
            
            {/* --- CORREÇÃO (Pedido 2): Adiciona a div 'form-list-grid' --- */}
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
              {/* Texto do botão muda se for histórico */}
              {transacaoId ? "Salvar Alterações" : "Salvar no Banco"}
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

        {/* Esta seção já estava correta, pois inclui a verificação !transacaoId */}
        {uiState === "initial" && !file && !transacaoId && (
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