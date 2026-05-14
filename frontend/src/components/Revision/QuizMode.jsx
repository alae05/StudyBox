import { useState, useRef } from "react";
import { Award, AlertCircle, ChevronRight } from "lucide-react";

export default function QuizMode({ onScore, data }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const hasScored = useRef(false);

  if (!data || data.length === 0) {
    return (
      <div className="revision-start-card">
        <h3>Aucun quiz trouvé.</h3>
        <p>Vérifie que tes questions sont bien liées au Module 1.</p>
      </div>
    );
  }

  const q = data[idx];

  if (!q) {
    return (
      <div className="revision-start-card">
        <h3>Erreur de chargement</h3>
        <button onClick={() => setIdx(0)}>Retour au début</button>
      </div>
    );
  }

  const options = q.options || [];
  const progress = ((idx + 1) / data.length) * 100;

  const handlePick = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (!hasScored.current) {
      hasScored.current = true;
      const isCorrect = options[i]?.isCorrect === 1 || options[i]?.isCorrect === true;
      onScore(isCorrect);
    }
  };

  const handleNext = () => {
    hasScored.current = false;
    if (idx < data.length - 1) {
      setIdx((prev) => prev + 1);
      setSelected(null);
    } else {
      setIsDone(true);
    }
  };

  if (isDone) return (
    <div className="revision-start-card">
      <Award size={48} color="#f59e0b" style={{ marginBottom: "1rem" }} />
      <h3>Session terminée !</h3>
      <button className="btn-start-session" onClick={() => { setIdx(0); setSelected(null); setIsDone(false); }}>Recommencer</button>
    </div>
  );

  return (
    <div className="quiz-container">
      <div className="quiz-progress">
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <span className="card-counter">Question {idx + 1} / {data.length}</span>
      </div>
      <div className="quiz-question"><h2>{q.question}</h2></div>
      <div className="quiz-options">
        {options.map((opt, i) => (
          <button
            key={opt.id || i}
            className="quiz-option"
            onClick={() => handlePick(i)}
            disabled={selected !== null}
            style={selected !== null ? (
              opt.isCorrect ? { borderColor: "#16a34a", background: "#dcfce7", color: "#16a34a" } :
              i === selected ? { borderColor: "#dc2626", background: "#fee2e2", color: "#dc2626" } :
              { opacity: 0.5 }
            ) : {}}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <p className="explanation"><AlertCircle size={14} /> {q.explanation}</p>
          <button className="next-btn" style={{ margin: "0 auto" }} onClick={handleNext}>Continuer <ChevronRight size={18} /></button>
        </div>
      )}
    </div>
  );
}
