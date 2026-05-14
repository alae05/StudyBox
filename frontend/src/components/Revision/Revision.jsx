import { useState, useEffect, useCallback, useRef } from "react";
import SideBar from "../SideBar";
import { getCurrentUser, getModules } from "../../api/api";
import "../../Styles/Revision.css";

import RevisionHeader     from "./RevisionHeader";
import ModeSelector       from "./ModeSelector";
import PomodoroSetup      from "./PomodoroSetup";
import FlashcardMode      from "./FlashcardMode";
import QuizMode           from "./QuizMode";
import ActiveRevisionMode from "./ActiveRevisionMode";
import SessionControls    from "./SessionControls";
import ModuleSelector     from "./ModuleSelector";

const API_BACK = "http://localhost:3000";

function MiniTimer({ running, secondsLeft, totalSec, onToggle, onReset }) {
  const pct = totalSec > 0 ? (1 - secondsLeft / totalSec) * 100 : 0;
  const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const s = String(secondsLeft % 60).padStart(2, "0");
  return (
    <div className="rev-mini-timer">
      <div className="rev-mini-bar">
        <div className="rev-mini-bar-fill" style={{ width: pct + "%" }} />
      </div>
      <span className="rev-mini-time">{m}:{s}</span>
      <button className="rev-mini-btn" onClick={onToggle}>{running ? "⏸" : "▶"}</button>
      <button className="rev-mini-btn" onClick={onReset} title="Réinitialiser">↺</button>
    </div>
  );
}


async function fetchDocumentContent(doc, moduleId) {
  try {
    const url = `${API_BACK}/modules/${Number(moduleId)}/documents/${Number(doc.id)}/text`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[Doc ${doc.id}] HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    const text = data.text;
    if (text && typeof text === "string" && text.trim().length > 50) {
      return text.trim();
    }
    console.warn(`[Doc ${doc.id}] Texte trop court ou vide:`, text?.length);
  } catch (err) {
    console.error(`[Doc ${doc.id}] Erreur fetch:`, err.message);
  }
  return null;
}

function AIGenerator({ moduleId, moduleName, userId, documents, onGenerated }) {
  const [loading, setLoading]         = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(false);

  async function generer() {
    if (!moduleName || !moduleId || !userId) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let documentContext = "";

      if (documents && documents.length > 0) {
        setLoadingStep("📄 Lecture des documents du module…");

        const docContents = await Promise.all(
          documents.map(async (doc) => {
            const content = await fetchDocumentContent(doc, moduleId);
            return {
              name: doc.name || doc.nomOriginal || `Document ${doc.id}`,
              content,
            };
          })
        );

        const docsWithContent    = docContents.filter(d => d.content);
        const docsWithoutContent = docContents.filter(d => !d.content);

        console.log(`[AIGenerator] ${docsWithContent.length}/${docContents.length} docs avec contenu extrait`);

        if (docsWithContent.length > 0) {
          const MAX_CONTEXT_CHARS = 6000;
          const charPerDoc = Math.floor(MAX_CONTEXT_CHARS / docsWithContent.length);

          documentContext = `

=== DOCUMENTS DU MODULE (base tes questions UNIQUEMENT sur ce contenu) ===
${docsWithContent
  .map(d => `--- ${d.name} ---\n${d.content.slice(0, charPerDoc)}`)
  .join("\n\n")}
=== FIN DES DOCUMENTS ===`;

          if (docsWithoutContent.length > 0) {
            documentContext += `\n(Extraction impossible pour : ${docsWithoutContent.map(d => d.name).join(", ")})`;
          }

        } else if (documents.length > 0) {
          setError("⚠️ Impossible d'extraire le contenu des documents. Vérifie que les fichiers sont accessibles sur le serveur (route /text) et que le format est supporté (PDF, DOCX, TXT).");
          setLoading(false);
          return;
        }
      }

      setLoadingStep("🤖 Génération des questions avec l'IA…");

      const hasRealContent = documentContext.includes("=== DOCUMENTS DU MODULE");

      const prompt = `Tu es un assistant pédagogique expert.${
        hasRealContent
          ? ` Génère du contenu de révision PRÉCIS et DIRECTEMENT basé sur les documents fournis pour le module "${moduleName}". Tu DOIS utiliser les concepts, définitions et faits présents dans les documents — ne génère AUCUNE question générique.`
          : ` Génère du contenu de révision pour le module "${moduleName}".`
      }${documentContext}

Réponds UNIQUEMENT avec un JSON valide (sans texte avant ou après, sans balises markdown), avec cette structure exacte :
{
  "flashcards": [
    { "question": "...", "answer": "...", "hint": "..." },
    { "question": "...", "answer": "...", "hint": "..." },
    { "question": "...", "answer": "...", "hint": "..." },
    { "question": "...", "answer": "...", "hint": "..." },
    { "question": "...", "answer": "...", "hint": "..." }
  ],
  "quiz": [
    {
      "question": "...",
      "explanation": "...",
      "options": [
        { "label": "...", "isCorrect": true,  "ordre": 0 },
        { "label": "...", "isCorrect": false, "ordre": 1 },
        { "label": "...", "isCorrect": false, "ordre": 2 },
        { "label": "...", "isCorrect": false, "ordre": 3 }
      ]
    }
  ]
}

Génère 5 flashcards et 5 questions de quiz.${
  hasRealContent
    ? " Chaque question DOIT citer ou reformuler un fait, une définition ou un concept tiré directement des documents fournis. Indique dans le hint d'où vient l'information si possible."
    : ` Porte sur les concepts fondamentaux de "${moduleName}".`
}
Chaque question de quiz doit avoir exactement 4 options avec une seule bonne réponse.
Questions précises, pédagogiques, adaptées à des étudiants.`;

      const response = await fetch(`${API_BACK}/revision/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Erreur API : " + response.status);

      const data = await response.json();
      const texte = data.content[0]?.text;
      if (!texte) throw new Error("Réponse vide de l'IA");

      const clean = texte.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(clean);

      if (!parsed.flashcards || !parsed.quiz) throw new Error("Format de réponse invalide");
      if (!Array.isArray(parsed.flashcards) || !Array.isArray(parsed.quiz)) {
        throw new Error("Les données générées ne sont pas des tableaux");
      }

      setLoadingStep("💾 Sauvegarde des flashcards…");

      const flashcardsToSave = parsed.flashcards.map(fc => ({
        moduleId,
        userId,
        tag: "IA",
        question: fc.question,
        answer: fc.answer,
        hint: fc.hint || null,
      }));

      const fcResponses = await Promise.all(
        flashcardsToSave.map(fc =>
          fetch(`${API_BACK}/revision/flashcards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fc),
          }).then(r => {
            if (!r.ok) throw new Error(`Erreur sauvegarde flashcard: ${r.status}`);
            return r.json();
          })
        )
      );

      setLoadingStep("💾 Sauvegarde des questions de quiz…");

      const quizToSave = parsed.quiz.map(q => ({
        moduleId,
        userId,
        question: q.question,
        explanation: q.explanation || null,
        options: q.options,
      }));

      const quizResponse = await fetch(`${API_BACK}/revision/quiz/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: quizToSave }),
      });

      if (!quizResponse.ok) throw new Error(`Erreur sauvegarde quiz: ${quizResponse.status}`);
      const savedQuiz = await quizResponse.json();

      setSuccess(true);
      setLoadingStep("");
      onGenerated(fcResponses, savedQuiz);

    } catch (err) {
      setError("Erreur lors de la génération : " + err.message);
      setLoadingStep("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rev-ai-section">
      <button
        className={`rev-ai-btn ${loading ? "loading" : ""}`}
        onClick={generer}
        disabled={loading || !moduleName}
      >
        {loading ? (
          <span className="rev-ai-spinner">⏳ {loadingStep || "Génération en cours…"}</span>
        ) : (
          <>✨ Générer avec l'IA</>
        )}
      </button>
      {success && (
        <div className="rev-ai-success">
          ✅ Questions générées et sauvegardées !
        </div>
      )}
      {error && <div className="rev-ai-error">{error}</div>}
      {!moduleName && (
        <span className="rev-ai-hint">Sélectionne un module pour activer la génération IA</span>
      )}
    </div>
  );
}

export default function Revision() {
  const [user] = useState(() => getCurrentUser());

  const [flashcards, setFlashcards]               = useState([]);
  const [quizQuestions, setQuizQuestions]         = useState([]);
  const [modules, setModules]                     = useState([]);
  const [selectedModuleId, setSelectedModuleId]   = useState(null);
  const [selectedModuleName, setSelectedModuleName] = useState("");
  const [moduleDocuments, setModuleDocuments]     = useState([]);

  const [initialLoading, setInitialLoading]       = useState(true);
  const [moduleLoading, setModuleLoading]         = useState(false);
  const [hasExistingData, setHasExistingData]     = useState(false);

  const [mode, setMode]                           = useState("flashcards");
  const [sessionStarted, setSessionStarted]       = useState(false);
  const [sessionDone, setSessionDone]             = useState(false);
  const [score, setScore]                         = useState({ correct: 0, total: 0 });
  const [modeKey, setModeKey]                     = useState(0);

  const [timeRemaining, setTimeRemaining]         = useState(25 * 60);
  const [totalSec, setTotalSec]                   = useState(25 * 60);
  const [timerActive, setTimerActive]             = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user?.id) { setInitialLoading(false); return; }

    async function loadData() {
      try {
        const mods = await getModules();
        const list = Array.isArray(mods) ? mods : [];
        setModules(list);

        if (list.length > 0) {
          const first = list[0];
          setSelectedModuleId(first.id);
          setSelectedModuleName(first.name || first.nom || "");
          await loadModuleData(first.id, user.id);
        } else {
          setSelectedModuleId(null);
          setSelectedModuleName("");
          setFlashcards([]);
          setQuizQuestions([]);
          setModuleDocuments([]);
          setHasExistingData(false);
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
    window.addEventListener("parametres-updated", loadData);
    return () => window.removeEventListener("parametres-updated", loadData);
  }, [user]);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            setSessionDone(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  async function loadModuleData(moduleId, userId) {
    setModuleLoading(true);
    try {
      const [cards, quiz, docs] = await Promise.all([
        fetch(`${API_BACK}/revision/flashcards/module/${moduleId}`)
          .then(r => r.ok ? r.json() : [])
          .catch(() => []),
        fetch(`${API_BACK}/revision/quiz/module/${moduleId}`)
          .then(r => r.ok ? r.json() : [])
          .catch(() => []),
        fetch(`${API_BACK}/modules/${moduleId}/documents`)
          .then(r => r.ok ? r.json() : [])
          .catch(() => []),
      ]);

      const cardList = Array.isArray(cards) ? cards : [];
      const quizList = Array.isArray(quiz)  ? quiz  : [];
      const docList  = Array.isArray(docs)  ? docs  : [];

      setFlashcards(cardList);
      setQuizQuestions(quizList);
      setModuleDocuments(docList);
      setHasExistingData(cardList.length > 0 || quizList.length > 0);

    } catch (err) {
      console.error("Erreur chargement module:", err);
    } finally {
      setModuleLoading(false);
    }
  }

  async function handleModuleSelect(moduleId) {
    if (sessionStarted) return;
    const mod = modules.find(m => m.id === moduleId);
    setSelectedModuleId(moduleId);
    setSelectedModuleName(mod?.name || mod?.nom || "");
    setModeKey(k => k + 1);
    setHasExistingData(false);
    setFlashcards([]);
    setQuizQuestions([]);
    setModuleDocuments([]);
    await loadModuleData(moduleId);
  }

  function handleAIGenerated(newCards, newQuiz) {
    setFlashcards(prev => [...prev, ...newCards]);
    setQuizQuestions(prev => [...prev, ...(Array.isArray(newQuiz) ? newQuiz : [])]);
    setHasExistingData(true);
  }

  const handleStart = (seconds) => {
    setTimeRemaining(seconds);
    setTotalSec(seconds);
    setSessionStarted(true);
    setTimerActive(true);
    setScore({ correct: 0, total: 0 });
    setModeKey(k => k + 1);
    setSessionDone(false);
  };

  const handleNewSession = () => {
    setTimerActive(false);
    setSessionStarted(false);
    setTimeRemaining(25 * 60);
    setTotalSec(25 * 60);
    setScore({ correct: 0, total: 0 });
    setModeKey(k => k + 1);
    setSessionDone(false);
  };

  const handleModeChange = (m) => { setMode(m); setModeKey(k => k + 1); };
  const handleScore = useCallback(c => {
    setScore(s => ({ correct: s.correct + (c ? 1 : 0), total: s.total + 1 }));
  }, []);

  function renderMainContent() {
    if (initialLoading) {
      return (
        <div className="revision-start-card">
          <div className="rev-loading-spinner" />
          <h3>Chargement de tes modules…</h3>
        </div>
      );
    }

    if (sessionStarted) {
      return (
        <div key={modeKey}>
          {mode === "flashcards" && <FlashcardMode      onScore={handleScore} data={flashcards}    />}
          {mode === "quiz"       && <QuizMode           onScore={handleScore} data={quizQuestions} />}
          {mode === "active"     && <ActiveRevisionMode onScore={handleScore} data={flashcards}    />}
        </div>
      );
    }

    if (moduleLoading) {
      return (
        <div className="revision-start-card">
          <div className="rev-loading-spinner" />
          <h3>Vérification du contenu existant…</h3>
          <p>On regarde si ce module a déjà des flashcards et questions de quiz.</p>
        </div>
      );
    }

    if (hasExistingData) {
      return <PomodoroSetup onStart={handleStart} />;
    }

    return (
      <div className="revision-start-card">
        <h3>Aucun contenu pour ce module</h3>
        <p>Clique sur <strong>Générer avec l'IA</strong> pour créer des flashcards et questions de quiz automatiquement.</p>
        {moduleDocuments.length > 0 && (
          <p className="rev-doc-hint">
            {moduleDocuments.length} document{moduleDocuments.length > 1 ? "s" : ""} trouvé{moduleDocuments.length > 1 ? "s" : ""} dans ce module — l'IA s'en inspirera pour des questions plus précises !
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <SideBar />
      <div className="revision-layout">

        <RevisionHeader timeRemaining={timeRemaining} score={score} />

        <ModuleSelector
          modules={modules}
          selectedId={selectedModuleId}
          onSelect={handleModuleSelect}
          sessionStarted={sessionStarted}
        />

        {!sessionStarted && !moduleLoading && (
          <div className="rev-ai-wrapper">
            {hasExistingData ? (
              <div className="rev-ai-status">
                {flashcards.length} flashcard{flashcards.length > 1 ? "s" : ""} et {quizQuestions.length} question{quizQuestions.length > 1 ? "s" : ""} prêtes
                {moduleDocuments.length > 0 && (
                  <span className="rev-ai-status-docs">
                    {moduleDocuments.length} document{moduleDocuments.length > 1 ? "s" : ""}
                  </span>
                )}
                <button
                  className="rev-ai-regen"
                  onClick={() => setHasExistingData(false)}
                  title="Régénérer du nouveau contenu"
                >
                  Régénérer
                </button>
              </div>
            ) : (
              <AIGenerator
                moduleId={selectedModuleId}
                moduleName={selectedModuleName}
                userId={user?.id}
                documents={moduleDocuments}
                onGenerated={handleAIGenerated}
              />
            )}
          </div>
        )}

        <ModeSelector mode={mode} onModeChange={handleModeChange} />

        {sessionStarted && !sessionDone && (
          <MiniTimer
            running={timerActive}
            secondsLeft={timeRemaining}
            totalSec={totalSec}
            onToggle={() => setTimerActive(a => !a)}
            onReset={handleNewSession}
          />
        )}


        {sessionDone && (
          <div className="revision-done-banner">
            ✅ Session terminée ! Score : {score.correct}/{score.total}
            <button onClick={handleNewSession} style={{ marginLeft: 16 }}>
              Nouvelle session
            </button>
          </div>
        )}

        <main className="revision-content">
          {renderMainContent()}
        </main>

        {sessionStarted && !sessionDone && (
          <SessionControls
            timerActive={timerActive}
            onTogglePause={() => setTimerActive(a => !a)}
            onNewSession={handleNewSession}
          />
        )}

      </div>
    </div>
  );
}
