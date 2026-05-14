import { getMatiereColor } from "./NotesList";

function formatDate(d) {
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function NoteItem({ note, module, active, onClick }) {
const color = module?.color || module?.couleur || getMatiereColor(note.matiere);
const preview =
  (note.contenu || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ") 
    .trim()
    .slice(0, 60) || "Note vide...";

  return (
    <div
      className={`notes-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <div
        className="notes-item-bar"
        style={{ background: color }}
      />
      <div className="notes-item-content">
        <div className="notes-item-title">{note.titre || "Sans titre"}</div>
        <div className="notes-item-preview">{preview}</div>
        <div className="notes-item-date">{formatDate(note.updatedAt)}</div>
      </div>
    </div>
  );
}
