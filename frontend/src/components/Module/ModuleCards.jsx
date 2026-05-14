import { BookOpen, FileText, Trash2, Clock } from "lucide-react";
import { progressColor } from "./Moduleutils";

export function ModuleCard({ mod, onOpen, onDelete }) {
  const color = progressColor(mod.progress);
  const docsCount = mod.docs?.length ?? 0;

  return (
    <div className="module-card" onClick={() => onOpen(mod)}>
      <div className="module-card-top">
        <div className="module-card-icon" style={{ background: mod.color + "18" }}>
          <BookOpen size={22} color={mod.color} />
        </div>
        <button className="module-card-delete" title="Supprimer"
          onClick={(e) => { e.stopPropagation(); onDelete(mod.id); }}>
          <Trash2 size={13} />
        </button>
      </div>
      <div className="module-card-name">{mod.name}</div>
      <div className="module-card-desc">{mod.description || "Aucune description."}</div>
      <div className="module-card-meta">
        <span className="module-card-badge" style={{ background: mod.color + "18", color: mod.color }}>
          {mod.category}
        </span>
        <span className="module-card-docs">
          <FileText size={11} /> {docsCount} doc{docsCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="module-card-progress-row">
        <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Progression</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color }}>{mod.progress}%</span>
      </div>
      <div className="progress-track" style={{ marginTop: 4 }}>
        <div className="progress-fill" style={{ width: `${mod.progress}%`, background: color }} />
      </div>
    </div>
  );
}

export function ModuleRow({ mod, onOpen, onDelete }) {
  const color = progressColor(mod.progress);
  const docsCount = mod.docs?.length ?? 0;

  return (
    <div className="module-row" onClick={() => onOpen(mod)}>
      <div className="module-row-icon" style={{ background: mod.color + "18" }}>
        <BookOpen size={18} color={mod.color} />
      </div>
      <div className="module-row-info">
        <div className="module-row-name">{mod.name}</div>
        <div className="module-row-sub">{mod.category} · {mod.semester}</div>
      </div>
      <div className="module-row-progress">
        <div className="progress-track" style={{ width: 120 }}>
          <div className="progress-fill" style={{ width: `${mod.progress}%`, background: color }} />
        </div>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color, minWidth: 34 }}>
          {mod.progress}%
        </span>
      </div>
      <div className="module-row-docs">
        <FileText size={13} color="#94a3b8" /> {docsCount}
      </div>
      <div className="module-row-activity">
        <Clock size={12} color="#94a3b8" /> {mod.lastActivity || "N/A"}
      </div>
      <button className="module-card-delete" title="Supprimer"
        onClick={(e) => { e.stopPropagation(); onDelete(mod.id); }}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}
