import { BookOpen, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./headerIndex.css";

export default function HeaderIndex() {
 const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <header className="header">

      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <BookOpen className="logoIcone" />
        <span className="titreLogo">StudyBox</span>
      </div>

      <nav className="nav">
        <a href="#hero" style={{ cursor: "pointer" }}>Accueil</a>
        <a href="#features">Fonctionnalités</a>
        <a onClick={() => navigate("/Connexion")} style={{ cursor: "pointer" }}>Connexion</a>
      </nav>

      <div className="actions">
        <button className="icon-btn" onClick={() => setDark(!dark)}>
          {dark ? <Sun size={18} color="white"/> : <Moon size={18} />}
        </button>
        <button className="btn-primary" onClick={() => navigate("/Connexion")}>
          Se connecter
        </button>
      </div>

    </header>
  );
}