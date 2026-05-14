import { useState, useEffect } from "react";
import studentImg from "../../assets/studi.png";

function salutation() {
  const heure = new Date().getHours();
  if (heure < 12) return "Bonjour";
  if (heure < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default function BannerDashboard() {
  const user = JSON.parse(localStorage.getItem("user")); 
  const prenom = user?.nomComplet?.split(" ")[0] ||  "";
  return (
    <div className="dashboard-banner-wrap">
      <div className="dashboard-banner-text">
        <h2 className="dashboard-banner-title">{salutation()}, {prenom} 👋</h2>
        <p className="dashboard-banner-sub">Voici votre tableau de bord pour aujourd'hui.</p>
        <div className="dashboard-banner-badges">
          <div className="db-badge-item">
            <span className="db-badge-label">Niveau</span>
            <span className="db-badge-value">{user.niveau} · {user.ecole}</span>
          </div>
          <div className="db-badge-divider" />
        </div>
      </div>
      <img src={studentImg} alt="" className="dashboard-banner-img" aria-hidden="true" />
    </div>
  );
}