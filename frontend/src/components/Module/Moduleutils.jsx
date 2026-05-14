export const API = "http://localhost:3000";

export const MODULE_COLORS = [
  "#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444",
  "#ec4899","#14b8a6","#f97316","#6366f1","#84cc16",
];

export const CATEGORIES = ["Scientifique","Technique","Gestion","Langues","Lettres","Autre"];

const FILE_META = {
  pdf:  { color: "#ef4444", bg: "#fef2f2", label: "PDF" },
  doc:  { color: "#3b82f6", bg: "#eff6ff", label: "Word" },
  docx: { color: "#3b82f6", bg: "#eff6ff", label: "Word" },
  ppt:  { color: "#f97316", bg: "#fff7ed", label: "PPT" },
  pptx: { color: "#f97316", bg: "#fff7ed", label: "PPT" },
  xls:  { color: "#10b981", bg: "#f0fdf4", label: "Excel" },
  xlsx: { color: "#10b981", bg: "#f0fdf4", label: "Excel" },
  png:  { color: "#8b5cf6", bg: "#f5f3ff", label: "Image" },
  jpg:  { color: "#8b5cf6", bg: "#f5f3ff", label: "Image" },
  jpeg: { color: "#8b5cf6", bg: "#f5f3ff", label: "Image" },
};

export const getFileMeta = (name) => {
  if (!name || typeof name !== "string") {
    return { color: "#64748b", bg: "#f1f5f9", label: "FILE" };
  }
  const ext = name.split(".").pop().toLowerCase();
  return FILE_META[ext] || { color: "#64748b", bg: "#f1f5f9", label: ext.toUpperCase() };
};

export const formatSize = (b) => {
  if (b == null || isNaN(b)) return "Taille inconnue";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};

export const progressColor = (progress) =>
  progress >= 75 ? "#10b981" : progress >= 40 ? "#3b82f6" : "#f59e0b";