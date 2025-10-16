// Remova o 'FaDownload' da linha abaixo
import { FaFilePdf, FaCheck, FaTimes } from "react-icons/fa";

type UploadBoxProps = {
  file: File | null;
  loading: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemove: () => void;
  onUpload: () => void;
  uploadButtonText?: string;
};

function UploadBox({
  file,
  loading,
  onFileSelect,
  onDrop,
  onRemove,
  onUpload,
  uploadButtonText,
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
            {loading ? "Processando..." : (uploadButtonText || "Enviar PDF")}
          </button>
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