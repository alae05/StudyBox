import { Clock, Flame } from "lucide-react";
import HeaderDashboard from "../Dashboard/HeaderDashboard";
import "../Dashboard/Dashboard.css";

export default function RevisionHeader({ timeRemaining, score }) {
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div>
     <HeaderDashboard title="Revision" />
    <header className="">
      
      
        {score.total > 0 && (
          <div className="revision-stat">
            <Flame size={18} color="#f59e0b" /> {score.correct} / {score.total}
          </div>
        )}
    </header>
    </div>
  );
}
