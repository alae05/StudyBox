import { useState, useEffect } from "react";
import SideBar from "../SideBar";
import NotesList from "./NotesList";
import NoteEditor from "./NoteEditor";
import { getNotes, createNote, updateNote, deleteNote } from "../../api/api";
import { getModules } from "../../api/api";
import "./Notes.css";
import HeaderDashboard from "../Dashboard/HeaderDashboard";
import "../Dashboard/Dashboard.css";
import { FileText, PencilLine, BookOpen, Plus, Search } from "lucide-react";

export default function Notes() {
  const [notes, setNotes]               = useState([]);
  const [modules, setModules]           = useState([]);
  const [selected, setSelected]         = useState(null);
  const [matiereActive, setMatiereActive] = useState("Toutes");
  const [recherche, setRecherche]       = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  useEffect(() => {
    async function charger() {
      setLoading(true);
      setError(null);
      try {
        const [notesData, modulesData] = await Promise.all([
          getNotes(),
          getModules(),
        ]);
        setNotes(notesData);
        setModules(modulesData);
        setSelected(notesData[0] || null);
      } catch (err) {
        setError("Impossible de charger les notes : " + err.message);
      } finally {
        setLoading(false);
      }
    }
    charger();
  }, []);

  async function handleNew() {
    try {
      const activeModule = matiereActive === "Toutes"
        ? null
        : modules.find(m => (m.name || m.nom) === matiereActive);

      const note = await createNote({
        titre:    "",
        contenu:  "",
        moduleId: activeModule?.id ?? null,
        matiere:  activeModule?.name || activeModule?.nom || "",
        tags:     "",
      });
      setNotes(prev => [note, ...prev]);
      setSelected(note);
    } catch (err) {
      setError("Erreur lors de la création de la note : " + err.message);
    }
  }

  async function handleUpdate(id, data) {
    try {
      const updated = await updateNote(id, data);
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      setSelected(updated);
    } catch (err) {
      console.error("Erreur mise à jour :", err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNote(id);
      const remaining = notes.filter(n => n.id !== id);
      setNotes(remaining);
      setSelected(remaining[0] || null);
    } catch (err) {
      setError("Erreur lors de la suppression : " + err.message);
    }
  }

  const notesFiltrees = notes.filter(note => {
    const passeFiltreModule = matiereActive === "Toutes"
      || (note.module?.name || note.module?.nom || note.matiere) === matiereActive;

    const terme = recherche.toLowerCase();
    const passeRecherche = terme === ""
      || note.titre?.toLowerCase().includes(terme)
      || note.matiere?.toLowerCase().includes(terme);

    return passeFiltreModule && passeRecherche;
  });

  const matieres = [
    "Toutes",
    ...modules.map(m => m.name || m.nom).filter(Boolean),
  ];

  return (
    <div className="notes-wrapper">
      <SideBar />

      <div className="notes-root">

        <HeaderDashboard title="Notes" />
        {error && <div className="notes-error-msg">{error}</div>}

        <div className="notes-body">
          <NotesList
            notes={notesFiltrees}
            allNotes={notes}
            modules={modules}
            matieres={matieres}
            matiereActive={matiereActive}
            selected={selected}
            loading={loading}
            onSelect={setSelected}
            onNew={handleNew}
            onMatiereChange={setMatiereActive}
          />

          {selected ? (
            <NoteEditor
              note={selected}
              modules={modules}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ) : (
            <div className="notes-empty-editor">
              <div className="notes-empty-icon">
                <BookOpen size={40} />
              </div>
              <p>Sélectironne une note ou crée-en une</p>
              <button onClick={handleNew}>
                <Plus size={16} /> Nouvelle note
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}