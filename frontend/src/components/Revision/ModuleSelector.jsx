
import { BookOpen } from "lucide-react";


export default function ModuleSelector({ modules = [], selectedId, onSelect, sessionStarted }) {
  if (!modules.length) {
    return (
      <div className="rev-module-empty">
        <BookOpen size={16} />
        <span>Aucun module trouvé. Créez un module pour commencer à réviser.</span>
      </div>
    );
  }

  return (
    <div className="rev-module-selector">
      <label className="rev-module-label">Réviser le module :</label>

      <div className="rev-module-list">
        {modules.map(mod => (
          <button
            key={mod.id}
            className={"rev-module-btn" + (selectedId === mod.id ? " active" : "")}
            style={selectedId === mod.id ? {
              borderColor: mod.color || mod.couleur,
              background: (mod.color || mod.couleur) + "18",
              color: mod.color || mod.couleur,
            } : {}}
            disabled={sessionStarted}
            onClick={() => onSelect(mod.id)}
            title={mod.name || mod.nom}
          >
            <span className="rev-module-dot" style={{ background: mod.color || mod.couleur }} />
            <span className="rev-module-name">{mod.name || mod.nom}</span>
            {mod.flashcardsCount > 0 && (
              <span className="rev-module-count">{mod.flashcardsCount}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
