import { useState } from "react";
import { ChevronRight, Lightbulb } from "lucide-react";

export default function FlashcardMode({ onScore, data }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [rated, setRated] = useState(false);

  if (!data || data.length === 0) return <div className="no-data">Aucune flashcard trouvée.</div>;

  const card = data[idx];

  const goNext = () => {
    setFlipped(false);
    setShowHint(false);
    setRated(false);
    setIdx((prev) => (prev + 1) % data.length);
  };

  const handleRate = (correct) => {
    if (rated) return;
    setRated(true);
    onScore(correct);
    setTimeout(goNext, 200);
  };

  return (
    <div className="flashcard-container">
      <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
        <div className="flashcard-front">
          <span className="tag-badge">{card.tag}</span>
          <h3>Question</h3>
          <p>{card.question}</p>
          <span className="flip-hint">Cliquer pour voir la réponse</span>
        </div>
        <div className="flashcard-back">
          <h3>Réponse</h3>
          <p>{card.answer}</p>
          <span className="flip-hint">Cliquer pour revenir</span>
        </div>
      </div>
      <div className="flashcard-controls">
        {!flipped && (
          <button onClick={(e) => { e.stopPropagation(); setShowHint(!showHint); }} className="hint-toggle">
            <Lightbulb size={16} /> {showHint ? card.hint : "Besoin d'un indice ?"}
          </button>
        )}
        {flipped && (
          <div className="difficulty-buttons">
            <button className="difficulty-btn hard" onClick={(e) => { e.stopPropagation(); handleRate(false); }}>Difficile</button>
            <button className="difficulty-btn medium" onClick={(e) => { e.stopPropagation(); handleRate(true); }}>Moyen</button>
            <button className="difficulty-btn easy" onClick={(e) => { e.stopPropagation(); handleRate(true); }}>Facile</button>
          </div>
        )}
        <div className="nav-buttons">
          <span className="card-counter">{idx + 1} / {data.length}</span>
          <button className="next-btn" onClick={(e) => { e.stopPropagation(); goNext(); }}>
            Suivant <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
