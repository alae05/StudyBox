import { useState, useEffect, useCallback } from "react";
import "../../Styles/Module.css";
import { getCurrentUser, getModules, getModule, createModule, deleteModule } from "../../api/api";
import { ModuleList } from "./ModuleList";
import { ModuleDetail } from "./Moduledetail";
import { ModuleFormModal } from "./ModuleModals";

export default function Module({ setActiveModuleId }) {
  const [user] = useState(() => getCurrentUser());
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    function loadModules() {
      setLoading(true);
      getModules()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setModules(list);
        setSelected((current) => {
          if (!current) return current;
          return list.some((module) => module.id === current.id) ? current : null;
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    }

    loadModules();
    window.addEventListener("parametres-updated", loadModules);
    return () => window.removeEventListener("parametres-updated", loadModules);
  }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const refreshSelectedModule = useCallback((modId) => {
    if (!modId) return;

    getModule(modId)
      .then((updated) => {
        setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        setSelected(updated);
      })
      .catch(() => {});
  }, []);

  const handleOpen = (mod) => {
    setSelected(mod);
    setActiveModuleId?.(mod.id);
  };

  const handleBack = () => {
    setSelected(null);
    setActiveModuleId?.(null);
    window.dispatchEvent(new CustomEvent("timer-set-visible", { detail: false }));
  };

  const handleAdd = (form) => {
    createModule(form)
      .then((newMod) => {
        setModules((prev) => [...prev, newMod]);
        setShowAdd(false);
        showToast("Module cree !");
      })
      .catch(() => showToast("Erreur lors de la creation."));
  };

  const handleDelete = (id) => {
    deleteModule(id).then(() => {
      setModules((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) handleBack();
      showToast("Module supprime.");
    });
  };

  const handleChange = (updated) => {
    setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSelected(updated);
  };

  if (loading) {
    return (
      <div className="dashboard-layout" style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "#94a3b8" }}>
        Chargement des modules...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-layout" style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "#94a3b8" }}>
        Veuillez vous connecter.
      </div>
    );
  }

  return (
    <div className="dashboard-layout" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: 0 }}>
      {selected ? (
        <ModuleDetail
          mod={selected}
          onBack={handleBack}
          onChange={handleChange}
          showToast={showToast}
          refreshModule={() => refreshSelectedModule(selected.id)}
          setActiveModuleId={setActiveModuleId}
        />
      ) : (
        <ModuleList
          modules={modules}
          onOpen={handleOpen}
          onAdd={() => setShowAdd(true)}
          onDelete={handleDelete}
        />
      )}

      {showAdd && <ModuleFormModal onClose={() => setShowAdd(false)} onSave={handleAdd} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
