import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adatech from "../assets/Polvo_AdaTech.png";
import UploadBox from "../components/UploadBox";
import Footer from "../components/Footer";

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
  | "exporting" // Reutilizado para 'saving' e 'exporting'
  | "downloaded";

function Tela_Principal() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  const [uiState, setUiState] = useState<UIState>("initial");
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null); // <<< NOVO ESTADO

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const isLoading =
    uiState === "extracting" ||
    uiState === "processing" ||
    uiState === "exporting"; // Agora inclui 'saving'

  const resetState = () => {
    setFile(null);
    setUiState("initial");
    setExtractedItems([]);
    setProcessedItems([]);
    setError(null);
    setSaveMessage(null); // <<< Resetar mensagem de salvamento
    const fileInput = document.getElementById("pdf-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleExtract = async () => {
    if (!file) return;
    setUiState("extracting");
    setError(null);
    setSaveMessage(null); // <<< Limpar msg ao re-extrair
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://localhost:8000/api/extract_from_pdf", {
        method: "POST",
        body: formData,
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
    setSaveMessage(null); // <<< Limpar msg ao re-processar
    try {
      const response = await fetch("http://localhost:8000/api/process_items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setError(err.message);
      setUiState("extracted");
    }
  };

  const handleExport = async () => {
    if (processedItems.length === 0) return;
    setUiState("exporting");
    setError(null);
    setSaveMessage(null); // <<< Limpar msg ao exportar
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
      setUiState("downloaded");
    } catch (err: any) {
      setError(err.message);
      setUiState("processed");
    }
  };

  // --- NOVA FUNÇÃO handleSaveToDB ---
  const handleSaveToDB = async () => {
    if (processedItems.length === 0) return;

    setUiState("exporting"); // Reutiliza o estado de loading
    setError(null);
    setSaveMessage(null);

    const token = localStorage.getItem("authToken"); // Pega o token para autenticação

    if (!token) {
      setError("Usuário não autenticado. Faça login novamente.");
      setUiState("processed");
      navigate("/login"); // Redireciona para login se não houver token
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/save_items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Envia o token
        },
        body: JSON.stringify({ items: processedItems }),
      });

      // Checa se a resposta tem conteúdo antes de tentar parsear JSON
      const responseBody = await response.text(); // Lê como texto primeiro
      let data;
      if (responseBody) {
          try {
              data = JSON.parse(responseBody); // Tenta parsear se houver texto
          } catch (jsonError) {
              console.error("Erro ao parsear JSON da resposta:", jsonError);
              // Decide como tratar: pode ser um erro ou a resposta pode ser só texto
              if (!response.ok) { // Se a resposta não for OK e não for JSON, joga um erro genérico
                throw new Error("Erro no servidor: Resposta inválida.");
              }
              // Se a resposta for OK mas não JSON, talvez seja só uma mensagem de texto
              data = { message: responseBody };
          }
      } else if (!response.ok) {
          // Se a resposta não for OK e não tiver corpo, joga erro com base no status
          throw new Error(`Erro no servidor: Status ${response.status}`);
      }


      if (!response.ok) {
        // Trata erro de autenticação especificamente
        if (response.status === 401) {
            setError("Sessão expirada ou inválida. Faça login novamente.");
            localStorage.removeItem("authToken"); // Remove token inválido
            navigate("/login");
        } else {
             // Usa a mensagem de 'detail' se existir no JSON parseado, senão erro genérico
            throw new Error(data?.detail || `Erro ao salvar: Status ${response.status}`);
        }
      } else {
           // Usa a mensagem do JSON parseado ou um fallback
          setSaveMessage(data?.message || "Itens salvos com sucesso!");
          // Mantém o estado em "processed" para o usuário poder baixar o Excel
          setUiState("processed");
      }

    } catch (err: any) {
      console.error("Erro na função handleSaveToDB:", err); // Log detalhado do erro
      setError(err.message || "Ocorreu um erro ao tentar salvar."); // Exibe a mensagem de erro
      setUiState("processed"); // Volta para processado em caso de erro
    }
  };
  // --- FIM DA NOVA FUNÇÃO ---

  const handleExtractedChange = (
    index: number,
    field: keyof ExtractedItem,
    value: string
  ) => {
    const updated = [...extractedItems];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedItems(updated);
    setSaveMessage(null); // <<< Limpar msg se editar
  };

  const handleProcessedChange = (
    index: number,
    field: keyof ProcessedItem,
    value: any
  ) => {
    const updated = [...processedItems];
    updated[index] = { ...updated[index], [field]: value };
    setProcessedItems(updated);
    setSaveMessage(null); // <<< Limpar msg se editar
  };

  const handleViewData = () => {
    setUiState("processed");
  };
  // ------------------------------------------------

  // --- Funções Originais Atualizadas ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      // Reseta o estado
      setUiState("initial");
      setExtractedItems([]);
      setProcessedItems([]);
      setError(null);
      setSaveMessage(null); // <<< Resetar msg
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      // Reseta o estado
      setUiState("initial");
      setExtractedItems([]);
      setProcessedItems([]);
      setError(null);
      setSaveMessage(null); // <<< Resetar msg
    }
  };

  // handleRemoveFile agora chama a função resetState
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

            {/* Exibe erro geral ou mensagem de salvamento */}
            {error && <p className="error-message" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
            {saveMessage && !error && <p className="success-message" style={{ color: 'green', marginTop: '1rem', fontWeight: 'bold' }}>{saveMessage}</p>}
            {/* ------------------------------------- */}


            {uiState === "initial" && !file && (
              <p className="disclaimer">
                A IA pode cometer erros. Considere verificar informações
                importantes.
              </p>
            )}
          </div>
        </div>

        {/* --- SEÇÃO DE VALIDAÇÃO DA EXTRAÇÃO --- */}
        {uiState === "extracted" && !isLoading && (
          <section className="validation-section">
            {/* Use h2 ou similar para títulos */}
            <h2>Validação da Extração:</h2>
            <p className="editable-note">
              Verifique e corrija os Part Numbers e descrições extraídos antes
              de continuar.
            </p>
            <div className="form-list-grid"> {/* Use uma classe consistente se aplicável */}
              {extractedItems.map((item, index) => (
                <ExtractionFormSection
                  key={index} // Chave deve estar no elemento raiz do map
                  item={item}
                  index={index}
                  onItemChange={handleExtractedChange}
                />
              ))}
            </div>
            <button
              onClick={handleProcess}
              disabled={isLoading}
              className="export-button" // Reutilize classes ou crie novas conforme necessário
            >
              Processar Itens Corrigidos
            </button>
          </section>
        )}

        {/* --- SEÇÃO DE VALIDAÇÃO FINAL --- */}
        {uiState === "processed" && !isLoading && (
          <section className="validation-section">
             {/* Use h2 ou similar para títulos */}
            <h2>Validação Final:</h2>

             {/* Mensagem de sucesso/erro já está fora desta seção, mais acima */}

            <div className="form-list-grid"> {/* Use uma classe consistente */}
              {processedItems.map((item, index) => (
                <FormSection
                  key={index} // Chave deve estar no elemento raiz do map
                  item={item}
                  index={index}
                  onItemChange={handleProcessedChange}
                />
              ))}
            </div>
            <p className="editable-note">É possível editar os campos!</p>

            {/* --- BOTÕES DE SALVAR E EXPORTAR --- */}
            <button
              onClick={handleSaveToDB}
              disabled={isLoading}
              // Use className="export-button" ou crie className="save-button"
              className="export-button"
              style={{ marginRight: '1rem' }} // Exemplo de espaçamento
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
            {/* ----------------------------------- */}
          </section>
        )}

        {/* --- SEÇÃO DOWNLOAD CONCLUÍDO --- */}
        {uiState === "downloaded" && !isLoading && (
          <section className="download-success-section" style={{ textAlign: 'center', marginTop: '2rem' }}> {/* Estilos inline para exemplo */}
            <FaCheckCircle className="success-icon" style={{ fontSize: '3rem', color: 'green', marginBottom: '1rem' }} />
             {/* Use h2 ou similar para títulos */}
            <h2>Download concluído com sucesso!</h2>
            <button onClick={handleViewData} className="view-data-button" style={{ marginRight: '1rem' }}> {/* Estilos inline */}
              Visualizar Dados Salvos
            </button>
            {/* Botão extra para iniciar um novo processo */}
            <button onClick={resetState} className="new-process-button"> {/* Estilos inline */}
                Iniciar Novo Processo
            </button>
             {/* Adicione estilos para view-data-button e new-process-button no CSS */}
          </section>
        )}
        {/* --- FIM DAS SEÇÕES ADICIONADAS --- */}


        {/* --- SEÇÃO MISSÃO (Mostrada apenas no início) --- */}
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

      <Footer />
    </div>
  );
}

export default Tela_Principal;