import { useState, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, Clock, FileText,
  CalendarDays, BarChart2, Settings, Sun, Moon, LogOut, User, Timer,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/sideBar.css";

export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [timerVisible, setTimerVisible] = useState(false);

  useEffect(() => {
    function onToggle() { setTimerVisible(v => !v); }
    function onSet(e) { setTimerVisible(e.detail); }
    window.addEventListener("timer-toggle", onToggle);
    window.addEventListener("timer-set-visible", onSet);
    return () => {
      window.removeEventListener("timer-toggle", onToggle);
      window.removeEventListener("timer-set-visible", onSet);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const publicPaths = ["/", "/connexion", "/inscription", "/forgot-password", "/verification-code", "/new-password"];
  if (publicPaths.includes(location.pathname)) return null;

  const toggleDark = () => setDark(!dark);
  const handleLogout = () => {
    localStorage.clear();
    navigate("/connexion");
  };

  const displayName = user?.nomComplet || user?.name || "Utilisateur";
  const initials = displayName.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard",  path: "/dashboard" },
    { icon: <BookOpen size={18} />,        label: "Modules",    path: "/modules"   },
    { icon: <Clock size={18} />,           label: "Revision",   path: "/revision"  },
    { icon: <FileText size={18} />,        label: "Notes",      path: "/notes"     },
    { icon: <CalendarDays size={18} />,    label: "Planner",    path: "/planner"   },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo" style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
        <BookOpen size={20} color="#3b82f6" />
        <span>StudyBox</span>
      </div>

      <div className="sidebar-nav">
        {navItems.map(({ icon, label, path }) => (
          <div key={path}
            className={`sidebar-item${location.pathname === path ? " active" : ""}`}
            onClick={() => navigate(path)}>
            {icon}
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div
          className={`sidebar-item sidebar-timer-btn${timerVisible ? " active" : ""}`}
          onClick={() => window.dispatchEvent(new Event("timer-toggle"))}
          title={timerVisible ? "Fermer le timer" : "Ouvrir le timer"}
        >
          <Timer size={18} />
          <span>Timer</span>
          {timerVisible && (
            <span style={{
              marginLeft: "auto",
              width: 8, height: 8,
              borderRadius: "50%",
              background: "#10b981",
              flexShrink: 0,
            }} />
          )}
        </div>

        <div className={`sidebar-profile${location.pathname === "/profile" ? " active" : ""}`}
          onClick={() => navigate("/profile")}>
          <div className="sidebar-profile-avatar">{initials}</div>
          <div className="sidebar-profile-info">
            <span className="sidebar-profile-name">{displayName}</span>
            <span className="sidebar-profile-sub">Voir mon profil</span>
          </div>
          <User size={14} className="sidebar-profile-arrow" />
        </div>

        <div className="sidebar-item" onClick={toggleDark}>
          {dark ? <Moon size={18} /> : <Sun size={18} />}
          <span>{dark ? "Mode Sombre" : "Mode Clair"}</span>
        </div>

        <div className="sidebar-item logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Déconnexion</span>
        </div>
      </div>
    </div>
  );
}