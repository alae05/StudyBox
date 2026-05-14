
import { useState } from "react";
import { createPortal } from "react-dom";
import "./Planner.css";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];

const modName  = m => m.name  || m.nom    || "";
const modColor = m => m.color || m.couleur || COLORS[0];

const emptyTask = { text: "", start: "09:00", end: "10:00", color: COLORS[0], priority: "Normal", moduleId: null, tag: "" };

function AddTaskModal({ onAdd, onClose, modules }) {
  const first = modules[0] || null;

  const [form, setForm] = useState({
    ...emptyTask,
    moduleId: first?.id    || null,
    tag:      first ? modName(first)  : "",
    color:    first ? modColor(first) : COLORS[0],
  });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const selectModule = (id) => {
    const mod = modules.find(m => m.id === Number(id));
    if (!mod) return;
    setForm(p => ({ ...p, moduleId: mod.id, tag: modName(mod), color: modColor(mod) }));
  };

  const submit = async () => {
    if (!form.text.trim()) return;
    setLoading(true);
    try { await onAdd({ ...form, done: false }); onClose(); }
    catch (err) { console.error("Erreur ajout :", err); }
    finally { setLoading(false); }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Nouvelle tâche</div>

        <input className="modal-input" placeholder="Titre de la tâche…"
          value={form.text} onChange={e => update("text", e.target.value)} />

        <div className="modal-row">
          <div className="modal-field">
            <label>Début</label>
            <input className="modal-input" type="time" value={form.start}
              onChange={e => update("start", e.target.value)} />
          </div>
          <div className="modal-field">
            <label>Fin</label>
            <input className="modal-input" type="time" value={form.end}
              onChange={e => update("end", e.target.value)} />
          </div>
        </div>

        <div className="modal-row">
          <div className="modal-field">
            <label>Module</label>
            
            <select className="modal-input" value={form.moduleId ?? ""}
              onChange={e => selectModule(e.target.value)}>
              {modules.length === 0 && <option value="">Aucun module</option>}
              {modules.map(m => (
                <option key={m.id} value={m.id}>
                  {modName(m)}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-field">
            <label>Priorité</label>
            <select className="modal-input" value={form.priority}
              onChange={e => update("priority", e.target.value)}>
              <option>Normal</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>

        {form.color && (
          <div className="modal-colors" style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0" }}>
            <span style={{ width: 14, height: 14, borderRadius: "50%", background: form.color, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "#64748b" }}>Couleur du module</span>
          </div>
        )}

        <div className="modal-actions">
          <button className="modal-btn modal-btn--cancel" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="modal-btn modal-btn--add" onClick={submit} disabled={loading}>
            {loading ? "…" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function TaskPanel({ tasks, modules = [], onAdd, onToggle, onDelete }) {
  const [showModal, setShowModal] = useState(false);


  const styleMap = Object.fromEntries(
    modules.map(m => [m.id, { bg: modColor(m) + "22", text: modColor(m) }])
  );
  const nameMap = Object.fromEntries(
    modules.map(m => [m.id, modName(m)])
  );

  const pending = (tasks || []).filter(t => !t.done);
  const done    = (tasks || []).filter(t =>  t.done);

  return (
    <aside className="task-panel">
      {showModal && (
        <AddTaskModal onAdd={onAdd} onClose={() => setShowModal(false)} modules={modules} />
      )}

      <div className="task-panel-header">
        <span className="task-panel-title">TÂCHES DU JOUR</span>
        <button className="task-add-btn" onClick={() => setShowModal(true)}>+ Ajouter</button>
      </div>

      <div className="task-list">
        {(tasks || []).length === 0 && <div className="task-empty">Aucune tâche planifiée</div>}

        {pending.map(t => (
          <TaskItem key={t.id} task={t} styleMap={styleMap} nameMap={nameMap} onToggle={onToggle} onDelete={onDelete} />
        ))}

        {pending.length > 0 && done.length > 0 && <div className="task-separator" />}

        {done.map(t => (
          <TaskItem key={t.id} task={t} styleMap={styleMap} nameMap={nameMap} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </div>
    </aside>
  );
}

function TaskItem({ task, styleMap, nameMap, onToggle, onDelete }) {
  const style = task.moduleId
    ? (styleMap[task.moduleId] || { bg: "#e2e8f0", text: "#64748b" })
    : { bg: task.color ? task.color + "22" : "#e2e8f0", text: task.color || "#64748b" };

  const label = task.moduleId ? (nameMap[task.moduleId] || task.tag) : task.tag;

  return (
    <div className="task-item">
      <div className="task-item-top">
        <button className={`task-check ${task.done ? "task-check--done" : ""}`}
          onClick={() => onToggle(task.id)}>
          {task.done ? "✓" : ""}
        </button>
        <span className={`task-text ${task.done ? "task-text--done" : ""}`}>{task.text}</span>
        <button className="task-delete" onClick={() => onDelete(task.id)}>×</button>
      </div>
      <div className="task-item-meta">
        {label && (
          <span className="task-tag" style={{ background: style.bg, color: style.text }}>
            {label}
          </span>
        )}
        <span className={`task-priority ${task.priority === "Urgent" ? "task-priority--urgent" : "task-priority--normal"}`}>
          {task.priority}
        </span>
        <span className="task-time">{task.start}</span>
      </div>
    </div>
  );
}
