import { FolderOpen, BookText, CalendarCheck, BarChart3, BrainCircuit, Coffee } from "lucide-react";
import "./Features.css";

export default function Features() {
  const fonctionnalite = [
    {
      icon: <FolderOpen size={24} color="#3b82f6" />,
      bg: "#E6F1FB",
      title: "Modules & documents",
      description: "Organisez vos matières et associez-y vos fichiers PDF et DOCX en quelques clics."
    },
    {
      icon: <BookText size={24} color="#3b82f6" />,
      bg: "#E6F1FB",
      title: "Notes",
      description: "Prenez des notes liées à vos modules pour centraliser vos cours et idées au même endroit."
    },
    {
      icon: <CalendarCheck size={24} color="#3b82f6" />,
      bg: "#E6F1FB",
      title: "Planner",
      description: "Planifiez vos tâches et deadlines dans un calendrier intuitif adapté à votre rythme."
    },
    {
      icon: <BarChart3 size={24} color="#3b82f6" />,
      bg: "#E6F1FB",
      title: "Progression",
      description: "Suivez votre avancement avec des statistiques détaillées et des graphiques motivants."
    },
    {
      icon: <BrainCircuit size={24} color="#3b82f6" />,
      bg: "#E6F1FB",
      title: "Révision IA",
      description: "Générez des flashcards et quiz personnalisés grâce à l'IA à partir de vos cours."
    },
    {
      icon: <Coffee size={24} color="#3b82f6" />,
      bg: "#E6F1FB",
      title: "Minuteur Pomodoro",
      description: "Gérez votre temps d'étude avec des sessions Pomodoro pour rester concentré et productif."
    }
  ];

  return (
    <section className="features-section" id="features">
      <div className="features-header">
        <h2 className="features-main-title">Tout ce dont vous avez besoin</h2>
        <p className="features-subtitle">Des outils puissants pour optimiser votre apprentissage.</p>
      </div>
      <div className="features-grid">
        {fonctionnalite.map((card, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-icon-wrapper" style={{ background: card.bg }}>
              {card.icon}
            </div>
            <h3 className="feature-title">{card.title}</h3>
            <p className="feature-description">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}