import NoteItem from "./NoteItem";
import { Plus } from "lucide-react";

export const MATIERE_COLORS = {
  "Mathématiques": "#8b5cf6",
  "Physique":      "#3b82f6",
  "Chimie":        "#f59e0b",
  "Informatique":  "#10b981",
  "Histoire":      "#ec4899",
  "Français":      "#ef4444",
  "Anglais":       "#06b6d4",
  "Biologie":      "#84cc16",
  "Économie":      "#0ea5e9",
};

export function getMatiereColor(matiere) {
  return MATIERE_COLORS[matiere] || "#64748b";
}

export default function NotesList({
  notes,
  allNotes,
  modules = [],
  matieres,
  matiereActive,
  selected,
  onSelect,
  onNew,
  onMatiereChange,
}) {

  return (
    <div className="notes-left">
      <div className="notes-left-top">
        <button className="notes-btn-new" onClick={onNew}>
          <Plus size={16} /> Nouvelle note
        </button>
      </div>
    
      <div className="notes-matieres">
        <div className="notes-matieres-label">MATIÈRES</div>
        {matieres.map(m => {
          const currentModule = modules.find(mod => (mod.name || mod.nom) === m);
          const count = m === "Toutes"  
              ? allNotes.length 
              : allNotes.filter(n => (n.module?.name || n.module?.nom || n.matiere) === m).length;
          return (
            <div
              key={m}
              className={`notes-matiere-item ${matiereActive === m ? "active" : ""}`}
              onClick={() => onMatiereChange(m)}
             >
              <span
                className="notes-matiere-dot"
                style={{
                  background:
                    m === "Toutes" ? "#3b82f6" : (currentModule?.color || currentModule?.couleur || getMatiereColor(m)),
                }}
              />
              <span className="notes-matiere-name">{m}</span>
              <span className="notes-matiere-count">{count}</span>
            </div>
          );
        })}
      </div>

      <div className="notes-list">
        {notes.map(note => (
          <NoteItem
            key={note.id}
            note={note}
            module={note.module || modules.find(m => m.id === note.moduleId)}
            active={selected?.id === note.id}
            onClick={() => onSelect(note)}
          />
        ))}
      </div>

    </div>
  );
}
