import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { saveTimerSession } from "../../api/api";

const PRESETS = [1, 5, 15, 25, 30, 45, 60];

function fmt(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function CoffeeCup({ fillPct, isRunning, isDone }) {
  const cupH = 54;
  const liquidY = 20 + cupH * (1 - fillPct);
  const liquidH = cupH * fillPct;
  const liquidColor = isDone ? "#d1d5db" : fillPct > 0.5 ? "#92400e" : fillPct > 0.2 ? "#b45309" : "#d97706";

  return (
    <svg viewBox="0 0 90 100" width="90" height="100" style={{ overflow: "visible", display: "block" }}>
      <defs>
        <clipPath id="cup-clip">
          <polygon points="12,20 78,20 70,74 20,74" />
        </clipPath>
      </defs>
      <polygon points="8,18 82,18 73,76 17,76"
        fill={isDone ? "#f3f4f6" : "#fef3c7"}
        stroke={isDone ? "#d1d5db" : "#92400e"}
        strokeWidth={isRunning ? "3" : "2.5"} strokeLinejoin="round" />
      {liquidH > 0 && (
        <rect x="12" y={liquidY} width="66" height={liquidH}
          fill={liquidColor} clipPath="url(#cup-clip)"
          style={{ transition: "y 0.8s ease, height 0.8s ease, fill 0.5s ease" }} />
      )}
      {fillPct > 0.05 && !isDone && (
        <ellipse cx="45" cy={liquidY} rx="28" ry="3.5"
          fill="#d97706" opacity="0.6" clipPath="url(#cup-clip)"
          style={{ transition: "cy 0.8s ease" }} />
      )}
      <rect x="7" y="14" width="76" height="7" rx="3.5" fill={isDone ? "#e5e7eb" : "#92400e"} />
      <ellipse cx="45" cy="80" rx="38" ry="6" fill={isDone ? "#e5e7eb" : "#fbbf24"} stroke={isDone ? "#d1d5db" : "#92400e"} strokeWidth="1.5" />
      <path d="M76 30 Q95 30 95 48 Q95 66 76 66" fill="none" stroke={isDone ? "#d1d5db" : "#92400e"} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function DonePopup({ durationMin, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "2rem 2.5rem", textAlign: "center", maxWidth: 300, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}`}</style>
        <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 6 }}>Session terminée !</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: "1.5rem" }}>
          Tu as étudié <strong>{durationMin} min</strong>.
        </p>
        <button onClick={onClose} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1.5px solid #92400e", background: "#fef3c7", color: "#92400e", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Terminer
        </button>
      </div>
    </div>
  );
}

export default function StudyTimer() {
  const user = JSON.parse(localStorage.getItem("user") ?? "null");

  const activeModuleIdRef = useRef(null);
  const [activeModuleId, setActiveModuleId] = useState(null);

  const [timerVisible, setTimerVisible] = useState(false);

  useEffect(() => {
    function onToggle() { setTimerVisible(v => !v); }
    function onSet(e) { setTimerVisible(e.detail); }
    function onSetModule(e) {
      console.log("timer-set-module reçu:", e.detail);
      activeModuleIdRef.current = e.detail.moduleId;
      setActiveModuleId(e.detail.moduleId);
    }

    window.addEventListener("timer-toggle", onToggle);
    window.addEventListener("timer-set-visible", onSet);
    window.addEventListener("timer-set-module", onSetModule);
    return () => {
      window.removeEventListener("timer-toggle", onToggle);
      window.removeEventListener("timer-set-visible", onSet);
      window.removeEventListener("timer-set-module", onSetModule);
    };
  }, []);

  const [durationMin, setDurationMin] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const intervalRef = useRef(null);
  const secondsElapsedRef = useRef(0);

  const totalSec = durationMin * 60;
  const fillPct = isDone ? 0 : secondsLeft / totalSec;
  const progressPct = 1 - fillPct;
  const progressColor = progressPct < 0.4 ? "#92400e" : progressPct < 0.75 ? "#f59e0b" : "#ef4444";

  const saveTimeProgress = async () => {
    const totalSecondsToSave = secondsElapsedRef.current;
    const modId = activeModuleIdRef.current;

    console.log("saveTimeProgress →", { totalSecondsToSave, modId, userId: user?.id });

    if (totalSecondsToSave < 1 || !user?.id) return;

    const minutes = Math.ceil(totalSecondsToSave / 60);
    secondsElapsedRef.current = 0;

    try {
      await saveTimerSession(user.id, modId, minutes);
      console.log(" Session sauvegardée :", minutes, "min, module:", modId);
      window.dispatchEvent(new CustomEvent("timer-session-saved", {
        detail: { moduleId: modId }
      }));
    } catch (err) {
      console.error("Echec sauvegarde:", err.message);
    }
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleStartPause = () => {
    if (isDone) return;
    if (isRunning) {
      stopInterval();
      setIsRunning(false);
      saveTimeProgress();
    } else {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        secondsElapsedRef.current += 1;

        if (secondsElapsedRef.current % 60 === 0) {
          saveTimeProgress();
        }

        setSecondsLeft((prev) => {
          if (prev <= 1) {
            stopInterval();
            setIsRunning(false);
            setIsDone(true);
            setShowPopup(true);
            setTimeout(() => saveTimeProgress(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handlePreset = (min) => {
    saveTimeProgress();
    stopInterval();
    setIsRunning(false);
    setIsDone(false);
    setDurationMin(min);
    setSecondsLeft(min * 60);
    secondsElapsedRef.current = 0;
  };

  const handleReset = () => {
    stopInterval();
    setIsRunning(false);
    setIsDone(false);
    setSecondsLeft(durationMin * 60);
    secondsElapsedRef.current = 0;
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    handleReset();
  };

  const onMouseDown = e => {
    if (e.target.closest("button")) return;
    setDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const onMove = e => { if (dragging) setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }); };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  useEffect(() => {
    return () => {
      stopInterval();
      saveTimeProgress();
    };
  }, []);

  return (
    <>
      <div onMouseDown={onMouseDown}
        style={{
          position: "fixed", left: position.x, top: position.y, zIndex: 1000,
          cursor: dragging ? "grabbing" : "grab", userSelect: "none", width: 300,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16,
          boxShadow: dragging ? "0 24px 48px rgba(0,0,0,0.18)" : "0 8px 24px rgba(0,0,0,0.10)",
          transition: dragging ? "none" : "box-shadow 0.2s, opacity 0.3s",
          overflow: "hidden",
          visibility: timerVisible ? "visible" : "hidden",
          opacity: timerVisible ? 1 : 0,
          pointerEvents: timerVisible ? "auto" : "none",
        }}>

        <div style={{ background: "#fef3c7", borderBottom: "1px solid #fde68a", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e", display: "flex", alignItems: "center", gap: 6 }}>
            ☕ Minuteur Coffee
          </span>
          <button onClick={() => setTimerVisible(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#b45309", padding: 2 }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: "14px 16px", cursor: "default" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
            {PRESETS.map(p => (
              <button key={p} onClick={() => handlePreset(p)} disabled={isRunning}
                style={{
                  padding: "4px 10px", borderRadius: 8,
                  border: durationMin === p && !isRunning && !isDone ? "1.5px solid #92400e" : "1px solid #e5e7eb",
                  background: durationMin === p && !isRunning && !isDone ? "#fef3c7" : "#f9fafb",
                  color: durationMin === p && !isRunning && !isDone ? "#92400e" : "#374151",
                  fontSize: 12, fontWeight: durationMin === p ? 600 : 400,
                  cursor: isRunning ? "not-allowed" : "pointer", opacity: isRunning ? 0.5 : 1
                }}>
                {p}m
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ animation: isRunning ? "sway 2s ease-in-out infinite" : "none" }}>
              <style>{`@keyframes sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}`}</style>
              <CoffeeCup fillPct={fillPct} isRunning={isRunning} isDone={isDone} />
            </div>
            <div style={{ fontSize: 30, fontWeight: 600, color: isDone ? "#10b981" : "#111827", letterSpacing: 2 }}>
              {isDone ? "✓ Terminé !" : fmt(secondsLeft)}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>
              {isDone ? `Session de ${durationMin} min complète` : isRunning ? "En cours…" : "En pause"}
            </div>
          </div>

          <div style={{ height: 5, background: "#f3f4f6", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
            <div style={{ height: "100%", width: `${progressPct * 100}%`, background: progressColor, borderRadius: 3, transition: "width 1s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", marginBottom: 14 }}>
            <span>0</span><span>{durationMin} min</span>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button onClick={handleReset} disabled={secondsLeft === totalSec && !isDone}
              style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", opacity: (secondsLeft === totalSec && !isDone) ? 0.4 : 1 }}>
              ↺ Reset
            </button>
            <button onClick={handleStartPause} disabled={isDone}
              style={{ padding: "8px 20px", borderRadius: 10, border: "1.5px solid #92400e", background: "#fef3c7", color: "#92400e", fontWeight: 600, cursor: "pointer" }}>
              {isRunning ? "⏸ Pause" : isDone ? "✓ Fait" : "▶ Démarrer"}
            </button>
          </div>
        </div>
      </div>

      {showPopup && <DonePopup durationMin={durationMin} onClose={handlePopupClose} />}
    </>
  );
}