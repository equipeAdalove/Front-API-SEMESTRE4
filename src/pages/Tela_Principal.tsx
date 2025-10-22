import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adatech from "../assets/Polvo_AdaTech.png";
import UploadBox from "../components/UploadBox";
import Footer from "../components/Footer";

function Tela_Principal() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setDownloadUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setDownloadUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setDownloadUrl(null);
    const fileInput = document.getElementById("pdf-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/process_pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro no processamento do PDF");

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      let filename = `${file.name.replace(".pdf", "")}_${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.xlsx`;

      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];

      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(filename);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
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

            <UploadBox
              file={file}
              loading={loading}
              downloadUrl={downloadUrl}
              downloadName={downloadName}
              onFileSelect={handleFileSelect}
              onDrop={handleDrop}
              onRemove={handleRemoveFile}
              onUpload={handleUpload}
              onDownload={handleDownload}
            />

            {!file && (
              <p className="disclaimer">
                A IA pode cometer erros. Considere verificar informações
                importantes.
              </p>
            )}
          </div>
        </div>

        {!file && (
          <section className="mission-section">
            <p>
              Minha missão é automatizar a criação da instrução de registro
              aduaneiro, garantindo que ela seja clara, completa e em
              conformidade com as exigências legais.
            </p>
            <p>Para isso, eu:</p>
            <ul>
              <li>
                Organizo e relaciono dados essenciais como Part-Number, NCM,
                fabricante e origem completa (com endereço)
              </li>
              <li>Gero descrições precisas dos produtos, evitando ambiguidades;</li>
              <li>
                Asseguro que a documentação seja compreensível para a Receita
                Federal, reduzindo o risco de multas ou penalidades.
              </li>
            </ul>
            <p>
              Meu objetivo é simplificar esse processo, tornando-o mais
              rápido, confiável e livre de erros.
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Tela_Principal;