export const BASE_URL = "http://localhost:3000";

export function getCurrentUser() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export function saveCurrentUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
  if (user?.id) localStorage.setItem("userId", String(user.id));
}

export function logoutUser() {
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
}

export function getUserId() {
  const directId = localStorage.getItem("userId");
  if (directId) return directId;

  const user = getCurrentUser();
  if (!user?.id) throw new Error("Non authentifie");
  return String(user.id);
}

export function getCurrentParametres() {
  const defaults = {
    semestreActuel: 1,
    phaseActuelle: 1,
    semestres: 2,
    phasesParSemestre: 2,
  };
  const stored = localStorage.getItem("studycore-parametres");
  if (!stored) return defaults;

  try {
    return { ...defaults, ...JSON.parse(stored) };
  } catch {
    return defaults;
  }
}

export function getCurrentSemesterLabel() {
  const { semestreActuel, phaseActuelle } = getCurrentParametres();
  return `S${semestreActuel} · Phase ${phaseActuelle}`;
}

export function moduleMatchesCurrentPhase(module) {
  const { semestreActuel, phaseActuelle } = getCurrentParametres();
  const normalize = (str) =>
    String(str || "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[·•\-–]/g, "·");   
  const value = normalize(module?.semester);
  const expected = normalize(`S${semestreActuel} · Phase ${phaseActuelle}`);
  const altDash = `S${semestreActuel} - Phase ${phaseActuelle}`;
  const altNoDot = `S${semestreActuel} Phase ${phaseActuelle}`;
  return (
    value === expected ||
    value === normalize(altDash) ||
    value === normalize(altNoDot) ||
    (value.includes(`S${semestreActuel}`) && value.includes(`Phase ${phaseActuelle}`))
  );
}

export function filterModulesByCurrentPhase(modules) {
  if (!Array.isArray(modules)) return [];
  return modules.filter(moduleMatchesCurrentPhase);
}

export async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: isFormData ? {} : { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}`;
    try {
      const err = await response.json();
      message = err.message || message;
    } catch {
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function getTasks(dayKey) {
  const userId = getUserId();
  return request(`/tasks?userId=${userId}&day=${encodeURIComponent(dayKey)}`);
}

export async function createTask(task) {
  const userId = getUserId();
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify({ ...task, userId }),
  });
}

export async function updateTask(id, data) {
  return request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function toggleTask(id) {
  return request(`/tasks/${id}/toggle`, { method: "PATCH" });
}

export async function deleteTask(id) {
  return request(`/tasks/${id}`, { method: "DELETE" });
}

export async function getModules({ currentPhaseOnly = true } = {}) {
  const userId = getUserId();
  const modules = await request(`/modules?userId=${userId}`);
  return currentPhaseOnly ? filterModulesByCurrentPhase(modules) : modules;
}

export async function getModule(id) {
  return request(`/modules/${id}`);
}

export async function createModule(module) {
  const userId = getUserId();
  return request("/modules", {
    method: "POST",
    body: JSON.stringify({
      ...module,
      userId,
      semester: module.semester || getCurrentSemesterLabel(),
      docs: module.docs || [],
    }),
  });
}

export async function updateModule(id, data) {
  const userId = getUserId();
  return request(`/modules/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...data, userId }),
  });
}

export async function deleteModule(id) {
  const userId = getUserId();
  return request(`/modules/${id}?userId=${userId}`, { method: "DELETE" });
}

export async function addModuleDocument(moduleId, userId, file) {
  const formData = new FormData();
  formData.append("file", file);
  return request(`/modules/${moduleId}/documents?userId=${userId}`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteModuleDocument(moduleId, docId) {
  return request(`/modules/${moduleId}/documents/${docId}`, { method: "DELETE" });
}

export async function getModuleDocuments(moduleId) {
  return request(`/modules/${moduleId}/documents`);
}

export async function getModuleDocumentText(moduleId, docId) {
  return request(`/modules/${Number(moduleId)}/documents/${Number(docId)}/text`);
}

export async function getNotes() {
  const userId = getUserId();
  return request(`/notes?userId=${userId}`);
}

export async function getNotesByModule(moduleId) {
  const userId = getUserId();
  return request(`/notes?userId=${userId}&moduleId=${moduleId}`);
}

export async function createNote(note) {
  const userId = getUserId();
  return request("/notes", {
    method: "POST",
    body: JSON.stringify({ ...note, userId }),
  });
}

export async function updateNote(id, data) {
  return request(`/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteNote(id) {
  return request(`/notes/${id}`, { method: "DELETE" });
}

export async function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(nom, email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ nom, email, password }),
  });
}

export async function envoyerCode(email) {
  return request("/auth/envoyer-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resendCode(email) {
  return request("/auth/renvoyer-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyCode(email, code) {
  return request("/auth/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function changerPassword(email, password, confirmation) {
  return request("/auth/changer-password", {
    method: "POST",
    body: JSON.stringify({ email, password, confirmation }),
  });
}

export async function getUserProfile(userId) {
  return request(`/users/${userId}/profile`);
}

export async function updateUserProfile(userId, data) {
  return request(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function uploadUserAvatar(userId, file) {
  const formData = new FormData();
  formData.append("avatar", file);
  return request(`/users/${userId}/avatar`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteUser(userId) {
  return request(`/users/${userId}`, { method: "DELETE" });
}

export async function getDashboardData(userId) {
  const [modules, tasks, notes] = await Promise.all([
    request(`/modules?userId=${userId}`),
    request(`/tasks?userId=${userId}&day=${encodeURIComponent(new Date().toDateString())}`),
    request(`/notes?userId=${userId}`),
  ]);

  return { modules: filterModulesByCurrentPhase(modules), tasks, notes };
}

export async function saveTimerSession(userId, moduleId, dureeMinutes) {
  return request("/timer-sessions", {
    method: "POST",
    body: JSON.stringify({
      userId,
      moduleId: moduleId ?? null,
      dureeMinutes,
      sujet: "Session d'etude",
    }),
  });
}

export async function getProgress(userId) {
  return request(`/progress/user/${userId}`);
}

export async function generateRevisionContent(prompt) {
  return request("/revision/ai/generate", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

export async function createFlashcard(data) {
  return request("/revision/flashcards", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getFlashcardsByModule(moduleId) {
  return request(`/revision/flashcards/module/${moduleId}`);
}

export async function createQuizBulk(questions) {
  return request("/revision/quiz/bulk", {
    method: "POST",
    body: JSON.stringify({ questions }),
  });
}

export async function getQuizByModule(moduleId) {
  return request(`/revision/quiz/module/${moduleId}`);
}
