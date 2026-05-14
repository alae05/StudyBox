import { useState, useEffect } from "react";

import { getDashboardData } from "../../api/api";

import HeaderDashboard from "./HeaderDashboard";
import BannerDashboard from "./BannerDashboard";

import "./Dashboard.css";
import {
  BookOpen,
  CheckSquare,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from "lucide-react";

function StatCard({ icon, label, value, color, subtitle }) {

  return (
    <div className="dc-stat-card">

      <div
        className="dc-stat-icon"
        style={{
          background: color + "18",
          color
        }}
      >
        {icon}
      </div>

      <div className="dc-stat-body">

        <div className="dc-stat-value">
          {value}
        </div>

        <div className="dc-stat-label">
          {label}
        </div>

        {subtitle && (
          <div className="dc-stat-subtitle">
            {subtitle}
          </div>
        )}

      </div>

    </div>
  );
}

function TaskItem({ task }) {

  return (
    <div
      className={
        "dc-task-item" +
        (task.done ? " dc-task-done" : "")
      }
    >

      <span
        className={
          "dc-task-dot" +
          (task.done ? " done" : "")
        }
      />

      <span className="dc-task-text">
        {task.text}
      </span>

      <span className="dc-task-time">
        {task.start}
      </span>

    </div>
  );
}
function ModuleProgressBar({ module }) {

  return (
    <div className="dc-module-row">

      <div className="dc-module-info">

        <span
          className="dc-module-dot"
          style={{ background: module.color }}
        />

        <span className="dc-module-name">
          {module.name}
        </span>

      </div>

      <div className="dc-progress-bar-wrap">

        <div
          className="dc-progress-bar-fill"
          style={{
            width: module.progress + "%",
            background: module.color
          }}
        />

      </div>

      <span className="dc-module-pct">
        {module.progress}%
      </span>

    </div>
  );
}


function calculerStats(data) {
  const modules = data.modules || [];
  const tasks = data.tasks || [];
  const notes = data.notes || [];
  const tasksDone =
    tasks.filter(t => t.done).length;

  const urgentTasks =
    tasks.filter(
      t => t.priority === "Urgent" && !t.done
    ).length;

  const totalProgress =
    modules.reduce(
      (somme, m) => somme + Number(m.progress||0),
      0
    );

  const moyenne=
    modules.length > 0
      ? Math.round(totalProgress / modules.length)
      : 0;

  return {
    totalModules: modules.length,
    totalTasks: tasks.length,
    tasksDone,
    urgentTasks,
    totalNotes: notes.length,
    moyenne
  };
}

export default function DashboardContent() {

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const user =JSON.parse(localStorage.getItem("user"));
  if(!user) return ;
  useEffect(() => {
    async function chargerDonnees() {
      setLoading(true);
      setError(null);
      try {
        const result = await getDashboardData(user.id);
        setData(result);

      } catch (err) {
        setError(
          "Impossible de charger le tableau de bord : " +
          err.message
        );

      } finally {
        setLoading(false);
      }
    }

    chargerDonnees();

  }, [user?.id]);

  const stats =data ? calculerStats(data) : null; 
  return (
    <div className="dashboard-layout">

      <HeaderDashboard title="Dashboard" />

      <BannerDashboard />


      {loading && (  <div className="dc-loading">

           <RefreshCw
            size={20}
            className="dc-spin"
          />

          Chargement de vos données...

        </div>

      )}


      {error && !loading && (

        <div className="dc-error">

          <AlertCircle size={16} />

          {error}

        </div>

      )}


      {stats && !loading && (

        <>


          <div className="dc-stats-grid">

            <StatCard
              icon={<BookOpen size={20} />}
              label="Modules actifs"
              value={stats.totalModules}
              color="#3b82f6"
              subtitle={
                "Progression moy. " +
                stats.moyenne +
                "%"
              }
            />

            <StatCard
              icon={<CheckSquare size={20} />}
              label="Tâches du jour"
              value={
                stats.tasksDone +
                "/" +
                stats.totalTasks
              }
              color="#10b981"
              subtitle={
                stats.tasksDone +
                " terminée(s)"
              }
            />

            <StatCard
              icon={<FileText size={20} />}
              label="Notes"
              value={stats.totalNotes}
              color="#8b5cf6"
              subtitle="total de notes"
            />

            <StatCard
              icon={<Clock size={20} />}
              label="Tâches urgentes"
              value={stats.urgentTasks}
              color={
                stats.urgentTasks > 0
                  ? "#ef4444"
                  : "#64748b"
              }
              subtitle={
                stats.urgentTasks > 0
                  ? "À traiter en priorité"
                  : "Tout est normal"
              }
            />

          </div>


          <div className="dc-two-columns">


            <div className="dc-card">

              <div className="dc-card-header">

                <CheckSquare size={16} />

                <span>
                  Tâches du jour
                </span>

                <span className="dc-badge">
                  {stats.totalTasks}
                </span>

              </div>

              {(data.tasks || []).length === 0 ? (

                <div className="dc-empty">
                  Aucune tâche planifiée aujourd'hui.
                </div>

              ) : (

                <div className="dc-task-list">

                  {data.tasks.map(task => (

                    <TaskItem
                      key={task.id}
                      task={task}
                    />

                  ))}

                </div>

              )}

            </div>


            <div className="dc-card">

              <div className="dc-card-header">

                <TrendingUp size={16} />

                <span>
                  Progression des modules
                </span>

              </div>

              {(data.modules || []).length === 0 ? (

                <div className="dc-empty">
                  Aucun module créé pour l'instant.
                </div>

              ) : (

                <div className="dc-modules-list">

                  {[...data.modules] .sort( (a, b) =>b.progress - a.progress)

                    .slice(0, 5)

                    .map(mod => (

                      <ModuleProgressBar
                        key={mod.id}
                        module={mod}
                      />

                    ))}

                </div>

              )}

            </div>

          </div>

        </>

      )}

    </div>
  );
}

// ============================================================
//  QUICK NAV
// ============================================================
export function QuickNav({
  modules = [],
  onNavigate
}) {

  if (!modules.length)
    return null;

  const topModules =
    modules.slice(0, 3);

  return (

    <div className="dc-quicknav">

      {topModules.map(mod => (

        <div
          key={mod.id}
          className="dc-quicknav-card"
          style={{
            borderLeft:
              `4px solid ${mod.color}`
          }}
          onClick={() =>
            onNavigate &&
            onNavigate("/modules")
          }
        >

          <div
            className="dc-quicknav-dot"
            style={{
              background: mod.color
            }}
          />

          <div className="dc-quicknav-body">

            <div className="dc-quicknav-name">
              {mod.name}
            </div>

            <div className="dc-quicknav-progress">
              {mod.progress}% complété
            </div>

          </div>

        </div>

      ))}

    </div>
  );
}