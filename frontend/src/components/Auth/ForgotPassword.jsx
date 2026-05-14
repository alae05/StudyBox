import { useState } from "react";
import "../../Styles/Inscription.css";
import { useNavigate } from "react-router-dom";
import Message from "./Message";

export default function ForgotPassword() {
  const currentEmail=  localStorage.getItem("email");
  console.log("email stocke :",currentEmail);
  const [email, setEmail] = useState(currentEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  async function handleSubmit(){
    if (!email) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/auth/envoyer-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.text();

      if (result === "ok") {
        localStorage.setItem("resetEmail", email);
        setMessage({ text: "Code envoyé à votre email !", type: "success" });
        setTimeout(() => navigate("/verification-code"), 1500);
      } else {
        setMessage({ text: "Aucun compte associé à cet email.", type: "error" });
      }
    } catch {
      setMessage({ text: "Erreur réseau.", type: "error" });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="auth-wrapper">
        <div className="auth-card">

          <div className="auth-logo" onClick={() => navigate("/")}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>

          <h1 className="auth-title">Mot de passe oublié</h1>
          <p className="auth-subtitle">Entrez votre email pour recevoir un code de vérification</p>

          <Message message={message} />

          <div className="field-group">
            <label className="field-label">Email</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setMessage(null)}
                className="auth-input"
                required
              />
            </div>
          </div>

          <button className="btn-Inscrip-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : "Envoyer le code"}
          </button>

          <p className="auth-redirect">
            <span className="auth-link" onClick={() => navigate("/connexion")}>
              ← Retour à la connexion
            </span>
          </p>

        </div>
      </div>
    </form>
  );
}