import { FaFilePdf, FaCheck, FaTimes, FaDownload } from "react-icons/fa";

type UploadBoxProps = {
  file: File | null;
  loading: boolean;
  downloadUrl: string | null;
  downloadName: string;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemove: () => void;
  onUpload: () => void;
  onDownload: () => void;
};

function UploadBox({
  file,
  loading,
  downloadUrl,
  downloadName,
  onFileSelect,
  onDrop,
  onRemove,
  onUpload,
  onDownload,
}: UploadBoxProps) {
  return (
    <div className="upload-box">
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
          <div className="submit-document-button-success">
            <div className="button-content">
              <FaFilePdf className="pdf-icon" />
              <span>Documento pronto para envio!</span>
            </div>
            <FaCheck className="check-icon" />
          </div>
          <div className="uploaded-file-name">
            <span>{file.name}</span>
            <button onClick={onRemove} className="remove-file-button">
              <FaTimes />
            </button>
          </div>
          <button onClick={onUpload} disabled={loading} className="export-button">
            {loading ? "Processando..." : "Enviar PDF"}
          </button>
          {downloadUrl && (
            <button onClick={onDownload} className="export-button">
              <FaDownload /> Baixar Resultado
            </button>
          )}
        </>
      )}

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
