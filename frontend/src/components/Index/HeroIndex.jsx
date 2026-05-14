import { Sparkles, ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import study from "../../assets/studi.png";

export default function HeroIndex() {
const navigate = useNavigate();

  return (
    <section className="hero" id="hero">
      <div className="bg-gradient"></div>
      <section className="hero">
        <div className="bg-gradient"></div>

        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
        <div className="bg-blob bg-blob-4"></div>

        <div className="bg-shape bg-shape-sq-1"></div>
        <div className="bg-shape bg-shape-sq-2"></div>
        <div className="bg-shape bg-shape-circle-1"></div>
        <div className="bg-shape bg-shape-circle-2"></div>
        <div className="bg-shape bg-shape-star-1"></div>
        <div className="bg-shape bg-shape-star-2"></div>

        <div className="hero-container">
          
        </div>
      </section>
  <div className="hero-container">

        <div className="hero-content">
          <div className="badge">
            <Sparkles className="icon-small" />
            Plateforme d'études intelligente
          </div>

          <h1 className="hero-title">
            Étudiez plus <span className="primary">intelligemment</span>,
            <br />pas plus longtemps.
          </h1>

          <p className="hero-text">
            Organisez vos cours, planifiez vos révisions et suivez votre progression
            avec l'aide de l'IA. Tout en un seul endroit.
          </p>

          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={() => navigate("/Inscription")}>
              Commencer <ArrowRight className="icon-small" />
            </button>
            <button className="btn-hero-second">
              <span className="play-circle">
                <Play size={11} fill="currentColor" />
              </span>
               En savoir plus
            </button>
          </div>
        </div>

        <div className="hero-visual">

          <div className="deco deco-triangle"></div>
          <div className="deco deco-triangle-sm"></div>
          <div className="deco deco-dots-tr"></div>
          <div className="deco deco-dots-bl"></div>
          <div className="deco deco-circle-orange"></div>
          <div className="deco deco-circle-blue"></div>
          <div className="deco deco-circle-outline"></div>
          <div className="deco deco-leaf"></div>
          <div className="deco deco-leaf-sm"></div>
          <div className="deco deco-star"></div>
          <div className="deco deco-star-sm"></div>
          <div className="deco deco-star-outline"></div>
          <div className="deco deco-cross"></div>
          <div className="deco deco-square"></div>

          <div >
             <img src={study} alt="Étudiant" className="hero-image" />
          </div>
          <div className="hero-image-shadow"></div>
        </div>

      </div>
    </section>
  );
}