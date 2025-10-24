import { FaFilePdf, FaCheck, FaTimes, FaDownload } from "react-icons/fa";

type UploadBoxProps = {
  file: File | null;
  loading: boolean;
  // Props adicionadas do seu segundo arquivo
  downloadUrl: string | null;
  downloadName: string;

  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemove: () => void;
  onUpload: () => void;
  // Prop adicionada do seu segundo arquivo
  onDownload: () => void;

  // Props do seu primeiro arquivo
  uploadButtonText?: string;
  showUploadButton?: boolean;
};

function UploadBox({
  file,
  loading,
  // Props adicionadas
  downloadUrl,
  downloadName,
  onFileSelect,
  onDrop,
  onRemove,
  onUpload,
  // Prop adicionada
  onDownload,
  // Props do primeiro arquivo
  uploadButtonText,
  showUploadButton = true,
}: UploadBoxProps) {
  return (
    <div className="upload-box">
      {/* Lógica de 'dropzone' do seu segundo arquivo */}
      {!file ? (
        <div
          className="submit-document-button"
          onClick={() => document.getElementById("pdf-upload")?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <FaFilePdf className="pdf-icon" />
          <span>Arraste o PDF aqui ou clique para procurar</span>
        </div>
      ) : (
        <>
          {/* Lógica de 'sucesso' do seu primeiro arquivo */}
          <div className="submit-document-button-success">
            <div className="button-content">
              <FaFilePdf className="pdf-icon" />
              <span>
                {showUploadButton
                  ? "Documento pronto para envio!"
                  : "Documento carregado:"}
              </span>
            </div>
            {showUploadButton && <FaCheck className="check-icon" />}
          </div>
          <div className="uploaded-file-name">
            <span>{file.name}</span>
            <button onClick={onRemove} className="remove-file-button">
              <FaTimes />
            </button>
          </div>

          {/* Botão de Upload condicional do seu primeiro arquivo */}
          {showUploadButton && (
            <button
              onClick={onUpload}
              disabled={loading}
              className="export-button"
            >
              {loading ? "Processando..." : uploadButtonText || "Enviar PDF"}
            </button>
          )}

          {/* Botão de Download adicionado do seu segundo arquivo */}
          {downloadUrl && (
            <button onClick={onDownload} className="export-button">
              <FaDownload /> Baixar Resultado
            </button>
          )}
        </>
      )}

      {/* Input 'hidden' do seu segundo arquivo */}
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={onFileSelect}
      />
    </div>
  );
}

export default UploadBox;