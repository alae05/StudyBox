import { RotateCcw, Play, Pause } from "lucide-react";

export default function SessionControls({ timerActive, onTogglePause, onNewSession }) {
  return (
    <div className="session-controls">
      <button className="session-btn pause" onClick={onTogglePause}>
        {timerActive ? <Pause size={16} /> : <Play size={16} />}
        {timerActive ? " Pause" : " Reprendre"}
      </button>
      <button className="session-btn reset" onClick={onNewSession}>
        <RotateCcw size={16} /> Nouvelle session
      </button>
    </div>
  );
}
