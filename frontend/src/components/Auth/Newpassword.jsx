import { useState } from "react";
import "../../Styles/Inscription.css";
import { useNavigate } from "react-router-dom";
import Message from "./Message";
export default function Newpassword() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message,setMessage]=useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");
  if(email==null){
    console.log("email null");
  }
  async function handleSubmit() {
    if (password !== confirmation) {
      setMessage({ text: "Les mots de passe ne correspondent pas", type: "error" });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: "Le mot de passe doit contenir au moins 6 caractères", type: "error" });
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/changer-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmation }),
      });

      const result = await response.text();

      if (result === "ok") {
        alert("Mot de passe changé !");
        navigate("/connexion");
      } else {
        setMessage({ text: result, type: "error" });
      }
    } catch {
      setMessage({ text: "Erreur réseau.", type: "error" });
    }
  }

  const isComplete = password.length > 0 && confirmation.length > 0;

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo" onClick={()=> navigate("/")}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="auth-title">Nouveau mot de passe</h1>
        <p className="auth-subtitle">Choisissez un nouveau mot de passe</p>
        <Message message={message} />
        {/* Champs */}
        <div className="field-group">
          <label className="field-label">Nouveau mot de passe</label>
          <input
            type={showPassword ? "text" : "password"}
            className="auth-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setMessage(null);
            }}
          />

        </div>

        <div className="field-group">
          <label className="field-label">Confirmer le mot de passe</label>
          <input
           type={showPassword ? "text" : "password"}
            className="auth-input"
            placeholder="••••••••"
            value={confirmation}
            onChange={(e) => {
              setConfirmation(e.target.value);
              setMessage(null);
            }}
          />
           <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁" : "🙈"}
           </span>
        </div>


        {/* Bouton */}
        <button
          className="btn-Inscrip-primary"
          disabled={!isComplete}
          onClick={handleSubmit}
        >
          Confirmer
        </button>

      </div>
    </div>
  );
}