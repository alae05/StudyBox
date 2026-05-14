import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, Edit2, RefreshCw, Trash2, Upload, X } from "lucide-react";
import "../../Styles/Profilepage.css";
import {
  deleteUser,
  getCurrentUser,
  getUserProfile,
  logoutUser,
  updateUserProfile,
  uploadUserAvatar,
} from "../../api/api";
import { Toast, getInitials } from "./ProfileComponents";



export default function ProfileMain() {
  const [user] = useState(() => getCurrentUser());
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConf, setDeleteConf] = useState("");
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  async function fetchProfile() {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);
      const data = await getUserProfile(user.id);
      setProfile(data);
      setAvatarUrl(data.avatarUrl || null);
      setEditForm({
        name: data.name || "",
        email: data.email || "",
        level: data.level || "",
        school: data.school || "",
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (!file.type.startsWith("image/")) {
      showToast("Veuillez selectionner une image valide.", "error");
      return;
    }

    setAvatarUrl(URL.createObjectURL(file));
    try {
      const data = await uploadUserAvatar(user.id, file);
      setAvatarUrl(data.avatarUrl);
      showToast("Photo de profil mise a jour.");
    } catch {
      showToast("Erreur lors de l'upload.", "error");
    }
  }

  async function saveEdit() {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      showToast("Le nom et l'email sont requis.", "error");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateUserProfile(user.id, editForm);
      setProfile((prev) => ({ ...prev, ...updated, initials: updated.initials || getInitials(updated.name) }));
      setEditing(false);
      showToast("Profil mis a jour.");
    } catch {
      showToast("Erreur lors de la sauvegarde.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteConf !== "SUPPRIMER") return;
    try {
      await deleteUser(user.id);
      logoutUser();
      window.location.href = "/connexion";
    } catch {
      showToast("Erreur lors de la suppression.", "error");
    }
  }

  if (!user) {
    return <div className="profile-state"><AlertCircle /> Veuillez vous connecter.</div>;
  }

  if (loading) {
    return <div className="profile-state"><RefreshCw className="spin" /> Chargement du profil...</div>;
  }

  if (error || !profile) {
    return (
      <div className="profile-state">
        <AlertCircle />
        Impossible de charger le profil.
        <button onClick={fetchProfile}>Reessayer</button>
      </div>
    );
  }

  const initials = profile.initials || getInitials(profile.name || "Utilisateur");

  return (
    <main className="profile-page">
      <Toast message={toast.msg} type={toast.type} />
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />

      <section className="profile-panel">
        <div className="profile-avatar" onClick={() => fileInputRef.current?.click()}>
          {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : <span>{initials}</span>}
          <div className="profile-avatar-overlay"><Camera size={18} /></div>
        </div>

        <div className="profile-main-info">
          <p className="profile-eyebrow">Mon profil</p>
          <h1>{profile.name || "Utilisateur"}</h1>
          <p>{profile.email}</p>
        </div>

        <div className="profile-actions">
          <button className="profile-btn" onClick={() => setEditing(true)}>
            <Edit2 size={15} /> Modifier
          </button>
          <button className="profile-btn light" onClick={() => fileInputRef.current?.click()}>
            <Upload size={15} /> Photo
          </button>
        </div>
      </section>

      <section className="profile-details">
        <div className="profile-row">
          <span>Niveau</span>
          <strong>{profile.level || "Non renseigne"}</strong>
        </div>
        <div className="profile-row">
          <span>Etablissement</span>
          <strong>{profile.school || "Non renseigne"}</strong>
        </div>
        <div className="profile-row">
          <span>Membre depuis</span>
          <strong>{profile.joinDate || "N/A"}</strong>
        </div>
      </section>

      <section className="profile-danger">
        <div>
          <strong>Zone de danger</strong>
          <p>La suppression de votre compte est definitive.</p>
        </div>
        <button onClick={() => { setDeleting(true); setDeleteConf(""); }}>
          <Trash2 size={15} /> Supprimer le compte
        </button>
      </section>

      {editing && (
        <div className="profile-modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditing(false)}>
          <div className="profile-modal">
            <div className="profile-modal-head">
              <h2>Modifier le profil</h2>
              <button onClick={() => setEditing(false)}><X size={16} /></button>
            </div>
            {[
              ["Nom complet", "name", "text"],
              ["Email", "email", "email"],
              ["Niveau", "level", "text"],
              ["Etablissement", "school", "text"],
            ].map(([label, key, type]) => (
              <label className="profile-field" key={key}>
                <span>{label}</span>
                <input
                  style={{backgroundColor:"white"}}
                  type={type}
                  value={editForm[key] || ""}
                  onChange={(e) => setEditForm((form) => ({ ...form, [key]: e.target.value }))}
                />
              </label>
            ))}
            <div className="profile-modal-actions">
              <button className="profile-btn light" onClick={() => setEditing(false)}>Annuler</button>
              <button className="profile-btn" onClick={saveEdit} disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="profile-modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleting(false)}>
          <div className="profile-modal">
            <div className="profile-modal-head danger">
              <h2>Supprimer le compte</h2>
              <button onClick={() => setDeleting(false)}><X size={16} /></button>
            </div>
            <p className="profile-delete-text">Tapez SUPPRIMER pour confirmer.</p>
            <label className="profile-field">
              <span>Confirmation</span>
              <input value={deleteConf} onChange={(e) => setDeleteConf(e.target.value)} />
            </label>
            <div className="profile-modal-actions">
              <button className="profile-btn light" onClick={() => setDeleting(false)}>Annuler</button>
              <button className="profile-btn danger" onClick={handleDelete} disabled={deleteConf !== "SUPPRIMER"}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
