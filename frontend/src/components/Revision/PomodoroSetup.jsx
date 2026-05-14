import { useState } from "react";
import { Coffee } from "lucide-react";

export default function PomodoroSetup({ onStart }) {
  const [minutes, setMinutes] = useState(25);
  const presets = [15, 25, 30, 45];

  return (
    <div className="revision-start-card">
      <div className="revision-timer-setup">
        <Coffee size={48} style={{ color: "#3b82f6", marginBottom: "1.5rem" }} />
        <h3>Prêt pour une session de révision ?</h3>
        <p className="revision-subtitle" style={{ marginBottom: "2rem" }}>
          Choisis la durée de ta session Pomodoro
        </p>
        <div className="timer-presets">
          {presets.map((t) => (
            <button
              key={t}
              className="timer-preset"
              style={minutes === t ? { borderColor: "#3b82f6", background: "#eff6ff", color: "#3b82f6", fontWeight: "700" } : {}}
              onClick={() => setMinutes(t)}
            >
              {t} min
            </button>
          ))}
        </div>
        <button className="btn-start-session" onClick={() => onStart(minutes * 60)}>
          Démarrer la session
        </button>
      </div>
    </div>
  );
}
