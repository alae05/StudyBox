import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Message from "./Message";
import "../../Styles/Inscription.css";
import "../../Styles/VerificationCode.css";

export default function VerificationCode({ email }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(600);
  const [renvoie, setRenvoie] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const inputsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // FIX 4: dépendance correcte → renvoie (pas setRenvoie)
  useEffect(() => {
    if (renvoie) return;

    const id = setInterval(() => {
      setTimer(p => {
        if (p <= 1) {
          clearInterval(id);
          setRenvoie(true);
          return 0;
        }
        return p - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [renvoie]);

  const handleChange = (value, i) => {
    if (!/^[0-9]?$/.test(value)) return;

    setMessage(null);

    const next = [...code];
    next[i] = value;
    setCode(next);

    if (value && i < 5) {
      inputsRef.current[i + 1].focus();
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputsRef.current[i - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!digits) return;

    const next = [...code];
    digits.split("").forEach((c, i) => {
      next[i] = c;
    });

    setCode(next);

    const idx = next.findIndex(c => c === "");
    inputsRef.current[idx === -1 ? 5 : idx]?.focus();
  };

  const handleResend = async () => {
    // FIX 3: vérifier renvoie (booléen) et non setRenvoie (fonction)
    if (!renvoie) return;

    setLoading(true);

    try {
      await fetch("http://localhost:3000/auth/renvoyer-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setCode(["", "", "", "", "", ""]);
      setTimer(600);
      setRenvoie(false);

      setMessage({
        text: "Code renvoyé avec succès !",
        type: "success"
      });

      inputsRef.current[0]?.focus();

    } catch {
      setMessage({
        text: "Erreur réseau.",
        type: "error"
      });
    }

    setLoading(false);
  };

  const handleVerify = async () => {
    setVerifying(true);

    try {
      const res = await fetch("http://localhost:3000/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.join("") }),
      });

      const result = await res.text();

      if (result === "ok") {
        setMessage({
          text: "Code vérifié avec succès !",
          type: "success"
        });

        setTimeout(() => {
          navigate("/new-password");
        }, 700);

      } else {
        setMessage({
          text: result,
          type: "error"
        });

        setCode(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
      }

    } catch {
      setMessage({
        text: "Erreur réseau.",
        type: "error"
      });
    }

    setVerifying(false);
  };

  const filled = code.filter(c => c !== "").length;
  // FIX 2: canResend dérivé de renvoie
  const canResend = renvoie;

  const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
  const secondes = String(timer % 60).padStart(2, "0");

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <div className="auth-logo" onClick={() => navigate("/")}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>

        <h1 className="auth-title">Vérification du code</h1>
        <p className="auth-subtitle">
          Entrez le code à 6 chiffres envoyé à votre email
        </p>

        <Message message={message} />

        <div className="otp-row" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
            style={{color:"black"}}
              key={i}
              ref={el => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              className={`otp-box ${digit ? "otp-filled" : ""}`}
            />
          ))}
        </div>

        <div className="otp-progress">
          <div
            className="otp-progress-fill"
            style={{ width: `${(filled / 6) * 100}%` }}
          />
        </div>

        <button
          className="btn-Inscrip-primary"
          disabled={filled < 6 || verifying}
          onClick={handleVerify}
        >
          {verifying ? (
            <span className="spinner"></span>
          ) : (
            "Vérifier le code"
          )}
        </button>

        <p className="auth-redirect">
          Pas reçu le code ?{" "}
          <span
            className="auth-link"
            onClick={handleResend}
            style={{
              opacity: canResend ? 1 : 0.4,
              cursor: canResend ? "pointer" : "default"
            }}
          >
            {loading ? <span className="spinner"></span> : "Renvoyer"}
          </span>

          {!canResend && (
            <span style={{ fontSize: "13px", marginLeft: "6px" }}>
              ({minutes}:{secondes})
            </span>
          )}
        </p>

      </div>
    </div>
  );
}