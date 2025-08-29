const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export function getToken(): string | null {
  return localStorage.getItem("ar_token");
}
export function setToken(tok: string) {
  localStorage.setItem("ar_token", tok);
}

async function req(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const tok = getToken();
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(tok || "")}`;
  return fetch(url, { ...opts, headers });
}

export async function signup(email: string, password: string) {
  const r = await fetch(`${BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json();
  setToken(j.token);
  return j;
}

export async function login(email: string, password: string) {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  const r = await fetch(`${BASE}/auth/login`, { method: "POST", body: form as any });
  const j = await r.json();
  setToken(j.token);
  return j;
}

export async function setKey(openaiKey: string) {
  const r = await req(`/user/key`, { method: "POST", body: JSON.stringify({ openai_api_key: openaiKey }) });
  return r.json();
}

export async function listProblems() {
  // For now, prefer public listing without auth
  const r = await fetch(`${BASE}/problems_public`);
  return r.json();
}

export async function createProblem(name: string, taskText: string, ext: string) {
  const r = await req(`/problems`, { method: "POST", body: JSON.stringify({ name, task_text: taskText, task_ext: ext }) });
  return r.json();
}

export async function runRound(name: string, rounds: number, provers: number, temperature: number, preset: string) {
  const r = await req(`/problems/${encodeURIComponent(name)}/run-round`, {
    method: "POST",
    body: JSON.stringify({ rounds, provers, temperature, preset }),
  });
  return r.json();
}

export async function getStatus(name: string) {
  const r = await req(`/problems/${encodeURIComponent(name)}/status`);
  return r.json();
}

export async function stopProblem(name: string) {
  const r = await req(`/problems/${encodeURIComponent(name)}/stop`, {
    method: "POST"
  });
  return r.json();
}

