import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import { MODULE_COLORS, CATEGORIES, getFileMeta, formatSize } from "./Moduleutils";



export function ModuleFormModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;

  const [form, setForm] = useState(
    initial ?? {
      name: "",
      description: "",
      category: "Scientifique",
      color: "#3b82f6",
      progress: 0,
    }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{isEdit ? "Modifier le module" : "Nouveau module"}</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-content">
          <div className="form-field">
            <label>Nom du module *</label>
            <input
              className="form-input"
              placeholder="Ex : Mathématiques"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea
              className="form-textarea"
              placeholder="Décrivez brièvement le contenu…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-field">
              <label>Catégorie</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

          </div>

          {isEdit && (
            <div className="form-field">
              <label>Progression ({form.progress}%)</label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.progress}
                style={{ marginTop: 8 }}
                onChange={(e) => set("progress", Number(e.target.value))}
              />
            </div>
          )}

          <div className="form-field">
            <label>Couleur</label>
            <div className="color-picker">
              {MODULE_COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-swatch${form.color === c ? " selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => set("color", c)}
                />
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose}>Annuler</button>
            <button
              className="btn-primary-modal"
              disabled={!form.name.trim()}
              onClick={() => form.name.trim() && onSave(form)}
            >
              {isEdit ? "Enregistrer" : "Créer le module"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UploadModal({ onClose, onSave }) {
  const [files, setFiles] = useState([]);
  const [dragover, setDragover] = useState(false);
  const ref = useRef();

  const add = (fileList) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).map((f) => ({
      id: `d${Date.now()}_${Math.random().toString(36).slice(2)}`,
      file: f,
      name: f.name,
      size: f.size,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Ajouter des documents</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-content">
          <div
            className={`modal-drop-zone${dragover ? " dragover" : ""}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); ref.current?.click(); }}
            onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
            onDragLeave={() => setDragover(false)}
            onDrop={(e) => { e.preventDefault(); setDragover(false); add(e.dataTransfer.files); }}
          >
            <Upload size={30} color="#94a3b8" />
            <p>Glissez vos fichiers ici ou <span>parcourir</span></p>
          </div>

          <input
            ref={ref}
            type="file"
            multiple
            style={{ display: "none" }}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              if (e.target.files?.length > 0) add(e.target.files);
              e.target.value = null;
            }}
          />

          {files.length > 0 && (
            <div className="modal-doc-list">
              {files.map((f) => {
                const m = getFileMeta(f.name);
                return (
                  <div key={f.id} className="modal-doc-item">
                    <span style={{ color: m.color, background: m.bg, padding: "4px 6px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                      {m.label}
                    </span>
                    <span className="doc-fname">{f.name || "Document"}</span>
                    <span className="doc-fsize">{formatSize(f.size)}</span>
                    <button
                      className="modal-remove-btn"
                      onClick={() => setFiles(files.filter((x) => x.id !== f.id))}
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose}>Annuler</button>
            <button
              className="btn-primary-modal"
              disabled={!files.length}
              onClick={() => files.length && onSave(files.map((f) => f.file))}
            >
              Ajouter ({files.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}