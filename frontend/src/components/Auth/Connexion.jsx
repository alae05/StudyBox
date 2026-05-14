import { useState } from "react";
import "../../Styles/Inscription.css";
import { useNavigate } from "react-router-dom";
import Message from "./Message";

export default function Connexion() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  async function handleLogin() {
    try {
      setLoading(true);
      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );
      const response = await fetch(
        "http://localhost:3000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );
      if (!response.ok) {
        throw new Error("Erreur serveur");
      }

      const data = await response.json();
      if (data.success) {
        setMessage({
          text: data.message,
          type: "success"
        });
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);

      } else {
        localStorage.setItem("email", email);
        setMessage({
          text: data.message,
          type: "error"
        });

        setTimeout(() => {
          setPassword("");
        }, 1000);
      }

  } catch (err) {
  setMessage({
            text:"Erreur serveur ou connexion",
            type: "error"
          });
  } finally {
        setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {e.preventDefault();handleLogin();}}>
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-logo" onClick={() => navigate("/")}>
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
          <h1 className="auth-title">
            Connexion
          </h1>

          <p className="auth-subtitle">
            Connectez-vous à votre espace StudyBox
          </p>

          <Message message={message} />

          <div className="field-group">

            <label className="field-label">
              Email
            </label>

            <div className="input-wrapper">
              <svg
                className="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20"height="16"rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>

              <input
                type="email"
                name="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                onFocus={() =>
                  setMessage(null)
                }
                className="auth-input"
                required
              />

            </div>

          </div>

          <div className="field-group">

            <label className="field-label">
              Mot de passe
            </label>

            <div className="input-wrapper">

              <svg
                className="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >

                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  ry="2"
                />

                <path d="M7 11V7a5 5 0 0 1 10 0v4" />

              </svg>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }

                name="motDePasse"

                placeholder="••••••••"

                value={password}

                onChange={(e) =>
                  setPassword(e.target.value)
                }

                onFocus={() =>
                  setMessage(null)
                }

                className="auth-input"

                required
              />

              <span
                className="eye-icon"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "👁" : "🙈"}
              </span>

            </div>

            <span
              className="auth-link forgot-password-link"
              onClick={() =>{
                navigate("/forgot-password");
                localStorage.setItem("email", email);
              }
            }
            >
              Mot de passe oublié ?
            </span>

          </div>

          <button
            type="submit"
            className="btn-Inscrip-primary"
            disabled={loading}
          >

            {
              loading
                ? <span className="spinner"></span>
                : "Se connecter"
            }

          </button>

          <p className="auth-redirect">
            Pas encore de compte ?{" "}
            <span
              className="auth-link"
              onClick={() =>
                navigate("/inscription")
              }
            >
              S'inscrire
            </span>

          </p>

        </div>

      </div>

    </form>
  );
}