import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function ActiveRevisionMode({ onScore, data }) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);

  if (!data || data.length === 0) return <div className="no-data">Aucune donnée pour la récitation.</div>;

  const card = data[idx];

  const handleFinish = (correct) => {
    onScore(correct);
    setRevealed(false);
    setInput("");
    setIdx((prev) => (prev + 1) % data.length);
  };

  return (
    <div className="active-revision">
      <div className="quiz-question">
        <span className="tag-label">{card.tag}</span>
        <h2 style={{ marginTop: "8px" }}>{card.question}</h2>
      </div>
      <textarea
        className="active-input"
        placeholder="Explique avec tes propres mots..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={revealed}
      />
      {!revealed ? (
        <button className="btn-start-session" disabled={input.trim().length < 5} onClick={() => setRevealed(true)}>
          Vérifier ma réponse
        </button>
      ) : (
        <div className="active-tips">
          <h4>Réponse attendue :</h4>
          <p>{card.answer}</p>
          <div className="difficulty-buttons">
            <button className="difficulty-btn hard" onClick={() => handleFinish(false)}><ThumbsDown size={16} /> À revoir</button>
            <button className="difficulty-btn easy" onClick={() => handleFinish(true)}><ThumbsUp size={16} /> J'avais compris</button>
          </div>
        </div>
      )}
    </div>
  );
}
