import { useState } from "react";
import { BookOpen, Plus, Search, Grid, List } from "lucide-react";
import { ModuleCard, ModuleRow } from "./ModuleCards";
import HeaderDashboard from "../Dashboard/HeaderDashboard";
import "../Dashboard/Dashboard.css";

export function ModuleList({ modules, onOpen, onAdd, onDelete }) {
  const [search, setSearch]     = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filterCat, setFilterCat] = useState("Tous");

  const cats = ["Tous", ...Array.from(new Set(modules.map((m) => m.category)))];

  const filtered = modules.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "Tous" || m.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <>
      <HeaderDashboard title="Mes Modules" />
      <div className="modules-list-page">

        <div className="modules-toolbar">
          <div className="modules-search-wrap">
            <Search size={15} color="#94a3b8" />
            <input
              className="modules-search"
              placeholder="Rechercher un module…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="modules-filters">
            {cats.map((c) => (
              <button
                key={c}
                className={`filter-btn${filterCat === c ? " active" : ""}`}
                onClick={() => setFilterCat(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="view-toggle">
            <button className={`view-btn${viewMode === "grid" ? " active" : ""}`}
              onClick={() => setViewMode("grid")}><Grid size={15} /></button>
            <button className={`view-btn${viewMode === "list" ? " active" : ""}`}
              onClick={() => setViewMode("list")}><List size={15} /></button>
          </div>
          <button className="hero-btn primary" onClick={onAdd}>
            <Plus size={15} /> Nouveau module
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="modules-empty">
            <BookOpen size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p>Aucun module trouvé.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="modules-grid">
            {filtered.map((m) => (
              <ModuleCard key={m.id} mod={m} onOpen={onOpen} onDelete={onDelete} />
            ))}
          </div>
        ) : (
          <div className="modules-list-rows">
            <div className="modules-list-head">
              <span style={{ flex: 1 }}>Module</span>
              <span style={{ width: 160 }}>Progression</span>
              <span style={{ width: 60, textAlign: "center" }}>Docs</span>
              <span style={{ width: 120 }}>Activité</span>
              <span style={{ width: 32 }}></span>
            </div>
            {filtered.map((m) => (
              <ModuleRow key={m.id} mod={m} onOpen={onOpen} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}