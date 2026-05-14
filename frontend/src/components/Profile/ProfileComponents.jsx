import {
  BookOpen, FileText, Clock, TrendingUp,
  CheckCircle, AlertCircle
} from "lucide-react";


export const STAT_CONFIG = {
  modules:     { icon: BookOpen,   label: "Modules",     sub: "actifs",      color: "#3b82f6" },
  documents:   { icon: FileText,   label: "Documents",   sub: "uploadés",    color: "#8b5cf6" },
  heures:      { icon: Clock,      label: "Heures",      sub: "de révision", color: "#10b981" },
  progression: { icon: TrendingUp, label: "Progression", sub: "moyenne",     color: "#f59e0b" },
};

export function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}



export function Toast({ message, type = "success" }) {
  if (!message) return null;
  const bg = type === "error" ? "#ef4444" : "#10b981";
  return (
    <div className="pp-toast" style={{ background: bg }}>
      {type === "success"
        ? <CheckCircle size={14} />
        : <AlertCircle size={14} />}
      {message}
    </div>
  );
}