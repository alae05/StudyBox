import { useState, useRef, useEffect } from "react";
import {
  BookOpen, ArrowLeft, Edit2, Plus,
  FileText, Save, BarChart2, CheckCircle,
  AlertCircle, Paperclip, Trash2, Timer,
  PanelRight, X, PencilLine,
} from "lucide-react";
import { API, getFileMeta, formatSize, progressColor } from "./Moduleutils";
import { ModuleFormModal, UploadModal } from "./ModuleModals";
import {
  createNote,
  deleteNote,
  getCurrentUser,
  getNotes,
  updateNote,
} from "../../api/api";
import DocumentViewer from "./DocumentViewer";

function formatMinutes(totalMinutes) {
  const mins = Number(totalMinutes) || 0;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function ModuleDetail({ mod, onBack, onChange, showToast, refreshModule, setActiveModuleId }) {
  const [user] = useState(() => getCurrentUser());

  const [timerDisplay, setTimerDisplay] = useState(null);
  const [timerVisible, setTimerVisible] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [workMode,   setWorkMode]   = useState(false);
  const [notes,      setNotes]      = useState(mod.notes || "");
  const [saving,     setSaving]     = useState(false);
  const [dragOver,   setDragOver]   = useState(false);
  const fileInputRef = useRef();

  const [workNotes,    setWorkNotes]    = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteContent,  setNoteContent]  = useState("");
  const [noteTitre,    setNoteTitre]    = useState("");
  const [noteSaving,   setNoteSaving]   = useState(false);
  const noteSaveTimer                   = useRef(null);

  
  useEffect(() => {
    function onTimerTick(e) {
      const { display, moduleId } = e.detail ?? {};
      if (moduleId == null || String(moduleId) === String(mod.id)) {
        setTimerDisplay(display ?? null);
      } else {
        setTimerDisplay(null);
      }
    }
    window.addEventListener("timer-tick", onTimerTick);
    return () => window.removeEventListener("timer-tick", onTimerTick);
  }, [mod.id]);


  useEffect(() => {
    function onSessionSaved(e) {
      const { moduleId } = e.detail ?? {};
      if (moduleId == null || String(moduleId) === String(mod.id)) {
        refreshModule?.();
      }
    }
    window.addEventListener("timer-session-saved", onSessionSaved);
    return () => window.removeEventListener("timer-session-saved", onSessionSaved);
  }, [mod.id, refreshModule]);

  useEffect(() => {
    if (!workMode) return;
    getNotes().then((allNotes) => {
      const modNotes = allNotes.filter(
        (n) => n.moduleId === mod.id || String(n.moduleId) === String(mod.id)
      );
      setWorkNotes(modNotes);
      if (modNotes.length > 0) {
        setSelectedNote(modNotes[0]);
        setNoteContent(modNotes[0].contenu || "");
        setNoteTitre(modNotes[0].titre || "");
      } else {
        setSelectedNote(null);
        setNoteContent("");
        setNoteTitre("");
      }
    }).catch(() => {});
  }, [workMode, mod.id]);

  function selectWorkNote(note) {
    setSelectedNote(note);
    setNoteContent(note.contenu || "");
    setNoteTitre(note.titre || "");
  }

  async function handleNewWorkNote() {
    const note = await createNote({
      titre: "Nouvelle note",
      contenu: "",
      moduleId: mod.id,
      matiere: mod.name,
      tags: "",
    });
    setWorkNotes((prev) => [note, ...prev]);
    selectWorkNote(note);
  }

  function autoSaveWorkNote(noteId, titre, contenu) {
    setNoteSaving(true);
    clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(async () => {
      try {
        const updated = await updateNote(noteId, { titre, contenu, moduleId: mod.id, matiere: mod.name });
        setWorkNotes((prev) => prev.map((n) => n.id === updated.id ? updated : n));
      } catch {}
      setNoteSaving(false);
    }, 800);
  }

  function handleWorkNoteContent(e) {
    const val = e.target.value;
    setNoteContent(val);
    if (selectedNote) autoSaveWorkNote(selectedNote.id, noteTitre, val);
  }

  function handleWorkNoteTitre(e) {
    const val = e.target.value;
    setNoteTitre(val);
    if (selectedNote) autoSaveWorkNote(selectedNote.id, val, noteContent);
  }

  async function handleDeleteWorkNote(noteId) {
    if (!window.confirm("Supprimer cette note ?")) return;
    await deleteNote(noteId);
    const remaining = workNotes.filter((n) => n.id !== noteId);
    setWorkNotes(remaining);
    if (selectedNote?.id === noteId) {
      const next = remaining[0] || null;
      setSelectedNote(next);
      setNoteContent(next?.contenu || "");
      setNoteTitre(next?.titre || "");
    }
  }

  const currentDocs         = Array.isArray(mod.docs) ? mod.docs : [];
  const color               = progressColor(mod.progress);
  const totalMinutesDisplay = formatMinutes(mod.totalHours ?? 0);

  function handleToggleTimer() {
  const next = !timerVisible;
  setTimerVisible(next);
  setActiveModuleId?.(next ? mod.id : null);
  window.dispatchEvent(new CustomEvent("timer-set-visible", { detail: next }));
  window.dispatchEvent(new CustomEvent("timer-set-module", {
    detail: { moduleId: next ? mod.id : null }
  }));
}

  const addDocs = (fileObjects) => {
    setShowUpload(false);
    fileObjects.forEach((file) => {
      const formData = new FormData();
      formData.append("file", file);
      const localDocData = {
        name: file.name, size: file.size,
        type: file.type || "Fichier",
        date: new Date().toLocaleDateString(),
      };
      fetch(`${API}/modules/${mod.id}/documents?userId=${user.id}`, {
        method: "POST", body: formData,
      })
        .then((r) => r.json())
        .then((backendDoc) => {
          onChange({ ...mod, docs: [...currentDocs, { ...localDocData, ...backendDoc }] });
        })
        .catch(() => {
          onChange({ ...mod, docs: [...currentDocs, { ...localDocData, id: Math.random().toString() }] });
        });
    });
    showToast(`${fileObjects.length} document${fileObjects.length > 1 ? "s" : ""} ajouté${fileObjects.length > 1 ? "s" : ""} !`);
  };

  const removeDoc = (docId) => {
    fetch(`${API}/modules/${mod.id}/documents/${docId}`, { method: "DELETE" }).then(() => {
      onChange({ ...mod, docs: currentDocs.filter((d) => d.id !== docId) });
      showToast("Document supprimé.");
    });
  };

  const openDoc = (doc) => {
    const ext = (doc.name || "").split(".").pop().toLowerCase();
    if (ext === "pdf") {
      setViewingDoc(doc);
      setWorkMode(true);
    } else {
      setViewingDoc(doc);
      setWorkMode(false);
    }
  };

  const closeDoc = () => { setViewingDoc(null); setWorkMode(false); };

  const saveEdit = (form) => {
    fetch(`${API}/modules/${mod.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then((updated) => { onChange(updated); setShowEdit(false); showToast("Module mis à jour !"); });
  };

  const saveNotes = async () => {
    if (!notes.trim()) return;
    setSaving(true);
    try {
      await createNote({
        titre: `Notes — ${mod.name}`,
        contenu: notes,
        moduleId: mod.id,
        matiere: mod.name,
        tags: "",
      });
      showToast("Note sauvegardée dans votre page Notes !");
    } catch {
      showToast("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (workMode && viewingDoc) {
    const fileUrl = `${API}/modules/${mod.id}/documents/${viewingDoc.id}/file`;
    return (
      <div className="work-mode-container">
        <div className="work-mode-header">
          <div className="work-mode-header-left">
            <button className="work-mode-close-btn" onClick={closeDoc}>
              <X size={13} /> Fermer
            </button>
            <span className="work-mode-doc-title">{viewingDoc.name}</span>
            <span className="work-mode-badge">MODE TRAVAIL</span>
          </div>
          <div className="work-mode-header-right">
            {timerDisplay && (
              <div className="work-mode-timer-pill">
                <Timer size={12} />
                {timerDisplay}
              </div>
            )}
            <button
              className={`work-mode-timer-btn ${timerVisible ? "active" : ""}`}
              onClick={handleToggleTimer}
            >
              <Timer size={13} />
              {timerVisible ? "Masquer timer" : "Démarrer timer"}
            </button>
          </div>
        </div>

        <div className="work-mode-split">
          <div className="work-mode-pdf-panel">
            <iframe
              src={fileUrl}
              className="work-mode-pdf-iframe"
              title={viewingDoc.name}
            />
          </div>

          <div className="work-mode-notes-panel">
            <div className="work-mode-tabs-header">
              <div className="work-mode-tabs-scroll">
                {workNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`work-mode-tab ${selectedNote?.id === note.id ? "active" : ""}`}
                    onClick={() => selectWorkNote(note)}
                  >
                    <FileText size={12} />
                    <span className="work-mode-tab-title">{note.titre || "Sans titre"}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteWorkNote(note.id); }}
                      className="work-mode-tab-delete"
                      title="Supprimer"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                <button onClick={handleNewWorkNote} className="work-mode-new-note-btn">
                  <Plus size={13} /> Note
                </button>
              </div>
            </div>

            {selectedNote ? (
              <div className="work-mode-note-content">
                <input
                  value={noteTitre}
                  onChange={handleWorkNoteTitre}
                  placeholder="Titre de la note..."
                  className="work-mode-note-title"
                />
                <textarea
                  value={noteContent}
                  onChange={handleWorkNoteContent}
                  placeholder="Prenez vos notes ici pendant la lecture…"
                  className="work-mode-note-textarea"
                />
                <div className="work-mode-note-footer">
                  {noteSaving ? (
                    <><PencilLine size={12} /> Sauvegarde...</>
                  ) : (
                    <><CheckCircle size={12} /> Sauvegardé automatiquement</>
                  )}
                </div>
              </div>
            ) : (
              <div className="work-mode-empty-notes">
                <FileText size={36} />
                <p>Aucune note pour ce module.</p>
                <button onClick={handleNewWorkNote} className="work-mode-create-note-btn">
                  <Plus size={14} /> Créer une note
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-detail-page">
      <div className="module-hero">
        <div className="module-hero-left">
          <div className="module-hero-icon" style={{ background: mod.color + "18" }}>
            <BookOpen size={26} color={mod.color} />
          </div>
          <div className="module-hero-info">
            <div className="module-hero-name">{mod.name}</div>
            <div className="module-hero-meta">
              <span className="badge" style={{ background: mod.color + "18", color: mod.color }}>
                {mod.category}
              </span>
            </div>
          </div>
        </div>
        <div className="module-hero-actions">
          {timerDisplay && !timerVisible && (
            <div className="timer-pill">
              <Timer size={12} /> {timerDisplay}
            </div>
          )}
          <button className="hero-btn" onClick={onBack}><ArrowLeft size={14} /> Retour</button>
          <button className="hero-btn" onClick={() => setShowEdit(true)}><Edit2 size={14} /> Modifier</button>
          <button
            className={`hero-btn ${timerVisible ? "timer-active" : ""}`}
            onClick={handleToggleTimer}
          >
            <Timer size={14} />
            {timerVisible ? "Masquer timer" : "Démarrer timer"}
          </button>
          <button className="hero-btn primary" onClick={() => setShowUpload(true)}>
            <Plus size={14} /> Ajouter un document
          </button>
        </div>
      </div>

      <div className="module-progress-bar-section">
        <div className="progress-label-row">
          <span>{mod.description}</span>
          <span style={{ fontWeight: 700, color }}>{mod.progress}% complété</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${mod.progress}%`, background: color }} />
        </div>
      </div>

      <div className="module-body">
        <div className="module-left-column">
          <div className="section-card">
            <div className="section-header">
              <span className="section-title">
                <Paperclip size={16} color="#3b82f6" /> Documents
                <span className="section-count">{currentDocs.length}</span>
              </span>
              <button
                className="section-action-btn"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragOver(false);
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length) addDocs(files);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={13} className={dragOver ? "rotate" : ""} />
                {dragOver ? "Déposer ici" : "Ajouter"}
              </button>
            </div>

            {currentDocs.length === 0 ? (
              <div className="empty-docs">
                <FileText size={36} />
                <p>Aucun document. Glissez vos fichiers sur le bouton "Ajouter".</p>
              </div>
            ) : (
              <div className="docs-list">
                {currentDocs.map((doc) => {
                  const m = getFileMeta(doc.name);
                  const ext = (doc.name || "").split(".").pop().toLowerCase();
                  const isPdf = ext === "pdf";
                  return (
                    <div key={doc.id} className="doc-row" onClick={() => openDoc(doc)}>
                      <div className="doc-icon-wrap" style={{ background: m.bg }}>
                        <span style={{ color: m.color, fontSize: 11, fontWeight: 700 }}>{m.label}</span>
                      </div>
                      <div className="doc-row-info">
                        <div className="doc-row-name">{doc.name || "Fichier sans nom"}</div>
                        <div className="doc-row-sub">{doc.type || "Inconnu"} · {formatSize(doc.size)} · {doc.date || ""}</div>
                      </div>
                      <div className="doc-row-actions">
                        {isPdf && (
                          <button
                            className="doc-row-btn work-mode-btn"
                            title="Mode travail (PDF + notes)"
                            onClick={(e) => { e.stopPropagation(); openDoc(doc); }}
                          >
                            <PanelRight size={14} />
                          </button>
                        )}
                        <button
                          className="doc-row-btn danger"
                          title="Supprimer"
                          onClick={(e) => { e.stopPropagation(); removeDoc(doc.id); }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.length) addDocs(Array.from(e.target.files));
                e.target.value = null;
              }}
            />
          </div>

          <div className="section-card">
            <div className="section-header">
              <span className="section-title"><FileText size={16} color="#8b5cf6" /> Notes personnelles</span>
              <span className="section-sub">Sera visible dans la page Notes</span>
            </div>
            <div className="notes-area">
              <textarea
                className="notes-textarea"
                placeholder="Vos notes, rappels, points importants…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <button
                className="notes-save-btn"
                onClick={saveNotes}
                disabled={saving || !notes.trim()}
              >
                <Save size={13} />
                {saving ? "Sauvegarde..." : "Enregistrer dans mes Notes"}
              </button>
            </div>
          </div>
        </div>

        <div className="module-right-column">
          <div className="section-card">
            <div className="section-header">
              <span className="section-title"><BookOpen size={16} color="#3b82f6" /> Informations</span>
            </div>
            <div className="info-rows">
              {[
                ["Catégorie", mod.category],
                ["Créé le", mod.createdAt || "N/A"],
                ["Progression", `${mod.progress}%`],
              ].map(([label, value]) => (
                <div key={label} className="info-row">
                  <span className="info-label">{label}</span>
                  <span className="info-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <span className="section-title"><BarChart2 size={16} color="#10b981" /> Statistiques</span>
            </div>
            <div className="mini-stats">
              {[
                { val: currentDocs.length, lbl: "Documents" },
                { val: totalMinutesDisplay, lbl: "Temps total" },
                { val: `${mod.progress}%`, lbl: "Progression" },
                { val: mod.progress >= 50 ? "Bon" : "À revoir", lbl: "Statut" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="mini-stat">
                  <div className="mini-stat-val">{val}</div>
                  <div className="mini-stat-lbl">{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <span className="section-title">
                {mod.progress >= 75
                  ? <><CheckCircle size={16} color="#10b981" /> En bonne voie</>
                  : <><AlertCircle size={16} color="#f50b0b" /> Nécessite attention</>}
              </span>
            </div>
            <div className="status-message">
              {mod.progress >= 75
                ? "Excellent travail ! Vous avez couvert la majeure partie du module."
                : mod.progress >= 40
                ? "Bonne progression. Pensez à revoir les chapitres non maîtrisés."
                : "Ce module nécessite plus d'attention. Planifiez des sessions régulières."}
            </div>
          </div>
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSave={addDocs} />}
      {showEdit && <ModuleFormModal initial={mod} onClose={() => setShowEdit(false)} onSave={saveEdit} />}

      {viewingDoc && !workMode && (
        <DocumentViewer doc={viewingDoc} moduleId={mod.id} onClose={closeDoc} />
      )}
    </div>
  );
}