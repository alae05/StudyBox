import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import { getMatiereColor } from "./NotesList";

import {
  Trash2,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function NoteEditor({ note, modules = [], onUpdate, onDelete }) {
  const [titre, setTitre] = useState(note.titre);
  const [contenu, setContenu] = useState(note.contenu || "<p></p>");
  const [matiere, setMatiere] = useState(note.matiere || "");
  const [moduleId, setModuleId] = useState(note.moduleId != null ? String(note.moduleId) : "");
  const [saved, setSaved] = useState(true);
  const [preview, setPreview] = useState(false);

  const [, setEditorVersion] = useState(0);

  const saveTimer = useRef(null);

  const latestRef = useRef({
    noteId: note.id,
    titre: note.titre,
    matiere: note.matiere || "",
    moduleId: note.moduleId != null ? String(note.moduleId) : null,
  });

  useEffect(() => {
    latestRef.current = {
      noteId: note.id,
      titre,
      matiere,
      moduleId: moduleId || null,
    };
  }, [note.id, titre, matiere, moduleId]);

  function autoSave(noteId, newTitre, newContenu, newMatiere, newModuleId = moduleId) {
    setSaved(false);
    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      onUpdate(noteId, {
        titre: newTitre,
        contenu: newContenu,
        matiere: newMatiere,
        moduleId: newModuleId ? Number(newModuleId) : null,
      });

      setSaved(true);
    }, 800);
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
    ],

    content: contenu,

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContenu(html);
      autoSave(
        latestRef.current.noteId,
        latestRef.current.titre,
        html,
        latestRef.current.matiere,
        latestRef.current.moduleId
      );
      setEditorVersion((v) => v + 1);
    },

    onSelectionUpdate: () => setEditorVersion((v) => v + 1),
    onFocus: () => setEditorVersion((v) => v + 1),
    onBlur: () => setEditorVersion((v) => v + 1),
  });

  useEffect(() => {
    setTitre(note.titre);
    setContenu(note.contenu || "<p></p>");
    setMatiere(note.matiere || "");
    setModuleId(note.moduleId != null ? String(note.moduleId) : "");
    setSaved(true);
    setPreview(false);

    if (editor) {
      editor.commands.setContent(note.contenu || "<p></p>", false);
    }
  }, [note.id, note.titre, note.contenu, note.matiere, note.moduleId, editor]);

  useEffect(() => {
    return () => clearTimeout(saveTimer.current);
  }, []);

  function handleTitre(e) {
    const newTitre = e.target.value;
    setTitre(newTitre);
    autoSave(note.id, newTitre, contenu, matiere, moduleId);
  }

  function handleMatiere(e) {
    const newModuleId = e.target.value;
    const selectedModule = modules.find(m => String(m.id) === newModuleId);
    const newMatiere = selectedModule?.name || "";

    setModuleId(newModuleId);
    setMatiere(newMatiere);
    autoSave(note.id, titre, contenu, newMatiere, newModuleId);
  }

  function toolbarAction(e, action) {
    e.preventDefault();
    if (!editor) return;
    action();
    setEditorVersion((v) => v + 1);
  }

  const wordCount =
    editor?.getText().trim().split(/\s+/).filter(Boolean).length || 0;

  return (
    <div className="notes-editor">
      <div className="notes-editor-top">
        <input
          className="notes-editor-title"
          value={titre}
          onChange={handleTitre}
          placeholder="Titre de la note..."
        />

        <div className="notes-editor-actions">
          <select
            className="notes-matiere-select"
            value={moduleId}
            onChange={handleMatiere}
            style={{
              borderLeft: `3px solid ${
                modules.find(m => String(m.id) === String(moduleId))?.color ||
                getMatiereColor(matiere)
              }`,
            }}
          >
            <option value="">Sans matière</option>
            {modules.map(m => (
              <option key={m.id} value={String(m.id)}>
                {m.name}
              </option>
            ))}
          </select>

          <button
            className={`notes-icon-btn ${preview ? "active" : ""}`}
            onClick={() => setPreview(!preview)}
            title={preview ? "Mode édition" : "Mode aperçu"}
          >
            {preview ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          <button
            className="notes-icon-btn danger"
            onClick={() => {
              if (window.confirm("Supprimer cette note ?")) {
                onDelete(note.id);
              }
            }}
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {!preview && (
        <div className="notes-toolbar">
          <button
            className={`notes-tb-btn ${editor?.isActive("bold") ? "active" : ""}`}
            onMouseDown={(e) => toolbarAction(e, () => editor.chain().focus().toggleBold().run())}
            title="Gras"
          >
            <Bold size={15} />
          </button>

          <button
            className={`notes-tb-btn ${editor?.isActive("italic") ? "active" : ""}`}
            onMouseDown={(e) => toolbarAction(e, () => editor.chain().focus().toggleItalic().run())}
            title="Italique"
          >
            <Italic size={15} />
          </button>

          <button
            className={`notes-tb-btn ${editor?.isActive("underline") ? "active" : ""}`}
            onMouseDown={(e) => toolbarAction(e, () => editor.chain().focus().toggleUnderline().run())}
            title="Souligné"
          >
            <Underline size={15} />
          </button>

          <div className="notes-tb-sep" />

          <button
            className={`notes-tb-btn ${editor?.isActive("heading", { level: 1 }) ? "active" : ""}`}
            onMouseDown={(e) => toolbarAction(e, () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
            title="Titre 1"
          >
            <Heading1 size={15} />
          </button>

          <button
            className={`notes-tb-btn ${editor?.isActive("heading", { level: 2 }) ? "active" : ""}`}
            onMouseDown={(e) => toolbarAction(e, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
            title="Titre 2"
          >
            <Heading2 size={15} />
          </button>

          <button
            className={`notes-tb-btn ${editor?.isActive("heading", { level: 3 }) ? "active" : ""}`}
            onMouseDown={(e) => toolbarAction(e, () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
            title="Titre 3"
          >
            <Heading3 size={15} />
          </button>

          <div className="notes-tb-sep" />

          <button
            className={`notes-tb-btn ${editor?.isActive("bulletList") ? "active" : ""}`}
            onMouseDown={(e) => toolbarAction(e, () => editor.chain().focus().toggleBulletList().run())}
            title="Liste"
          >
            <List size={15} />
          </button>

          <button
            className={`notes-tb-btn ${editor?.isActive("orderedList") ? "active" : ""}`}
            onMouseDown={(e) => toolbarAction(e, () => editor.chain().focus().toggleOrderedList().run())}
            title="Liste numérotée"
          >
            <ListOrdered size={15} />
          </button>

          <div className="notes-tb-sep" />

          <button
            className={`notes-tb-btn ${editor?.isActive("code") ? "active" : ""}`}
            onMouseDown={(e) => toolbarAction(e, () => editor.chain().focus().toggleCode().run())}
            title="Code"
          >
            <Code size={15} />
          </button>

          <button
            className={`notes-tb-btn ${editor?.isActive("blockquote") ? "active" : ""}`}
            onMouseDown={(e) => toolbarAction(e, () => editor.chain().focus().toggleBlockquote().run())}
            title="Citation"
          >
            <Quote size={15} />
          </button>
        </div>
      )}

      {preview ? (
        <div
          className="notes-preview"
          dangerouslySetInnerHTML={{
            __html: contenu || "<p><em>Aucun contenu...</em></p>",
          }}
        />
      ) : (
        <EditorContent editor={editor} className="notes-rich-editor" />
      )}

      <div className="notes-editor-footer">
        <span>
          {saved ? (
            <>
              <CheckCircle size={14} /> Sauvegardé
            </>
          ) : (
            <>
              <Loader2 size={14} className="spin" /> Sauvegarde...
            </>
          )}
        </span>
        <span
          className="notes-preview-toggle"
          onClick={() => setPreview(!preview)}
        >
          {preview ? (
            <><EyeOff size={13} /> Éditer</>
          ) : (
            <><Eye size={13} /> Aperçu</>
          )}
        </span>
        <span>{wordCount} mots</span>
      </div>
    </div>
  );
}
