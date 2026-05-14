import { Sparkles, Brain, Volume2 } from "lucide-react";

const MODES = [
  { id: "flashcards", label: "Flashcards", icon: <Sparkles size={16} /> },
  { id: "quiz",       label: "Quiz",       icon: <Brain size={16} />    },
  { id: "active",     label: "Récitation", icon: <Volume2 size={16} />  },
];

export default function ModeSelector({ mode, onModeChange }) {
  return (
    <nav className="revision-mode-selector">
      {MODES.map((m) => (
        <button
          key={m.id}
          className={`mode-btn ${mode === m.id ? "active" : ""}`}
          onClick={() => onModeChange(m.id)}
        >
          {m.icon} {m.label}
        </button>
      ))}
    </nav>
  );
}
