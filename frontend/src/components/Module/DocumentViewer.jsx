
import { useEffect, useState } from "react";
import { X, Download, ExternalLink, FileText, Maximize2, Minimize2 } from "lucide-react";
import "./DocumentViewer.css";

const API = "http://localhost:3000";


export default function DocumentViewer({ doc, moduleId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  const fileUrl = `${API}/modules/${moduleId}/documents/${doc.id}/file`;

  const ext = (doc.name || doc.nomOriginal || "").split(".").pop().toLowerCase();
  const isPdf   = ext === "pdf";
  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("doc-history") || "[]");
    const entry = { docId: doc.id, name: doc.name || doc.nomOriginal, moduleId, openedAt: Date.now() };
    const updated = [entry, ...history.filter(h => h.docId !== doc.id)].slice(0, 10);
    localStorage.setItem("doc-history", JSON.stringify(updated));

    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);

    return () => document.removeEventListener("keydown", handleKey);
  }, [doc.id, moduleId, onClose]);

  return (
    <div className={"doc-viewer-overlay" + (fullscreen ? " fullscreen" : "")} role="dialog" aria-label="Visionneuse de document">

      <div className="doc-viewer-header">
        <div className="doc-viewer-title">
          <FileText size={16} />
          <span>{doc.name || doc.nomOriginal || "Document"}</span>
          <span className="doc-viewer-ext">{ext.toUpperCase()}</span>
        </div>
        <div className="doc-viewer-actions">
          <button className="doc-viewer-btn" onClick={() => setFullscreen(f => !f)} title="Plein écran">
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <a className="doc-viewer-btn" href={fileUrl} download={doc.name} title="Télécharger">
            <Download size={16} />
          </a>
          <a className="doc-viewer-btn" href={fileUrl} target="_blank" rel="noreferrer" title="Ouvrir dans un onglet">
            <ExternalLink size={16} />
          </a>
          <button className="doc-viewer-btn danger" onClick={onClose} title="Fermer (Échap)">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="doc-viewer-body">

        {loading && (
          <div className="doc-viewer-loading">Chargement du document...</div>
        )}

        {error && (
          <div className="doc-viewer-error">
            Impossible d'afficher ce fichier.{" "}
            <a href={fileUrl} target="_blank" rel="noreferrer">Ouvrir dans un onglet</a>
          </div>
        )}

        {isPdf && (
          <iframe
            src={fileUrl}
            className="doc-viewer-iframe"
            title={doc.name}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
        )}

        {isImage && (
          <div className="doc-viewer-image-wrap">
            <img
              src={fileUrl}
              alt={doc.name}
              className="doc-viewer-image"
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
            />
          </div>
        )}

        {!isPdf && !isImage && (
          <div className="doc-viewer-unsupported">
            <FileText size={48} style={{ color: "#94a3b8" }} />
            <p>Ce format ({ext.toUpperCase()}) ne peut pas être prévisualisé directement.</p>
            <a href={fileUrl} download={doc.name} className="doc-viewer-download-btn">
              <Download size={16} /> Télécharger le fichier
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
