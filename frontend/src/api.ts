const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function req(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  return fetch(`${BASE}${path}`, { ...opts, headers });
}

export async function listProblems() {
  const r = await req(`/problems_public`);
  return r.json();
}

export async function getRounds(name: string) {
  const r = await req(`/problems_public/${encodeURIComponent(name)}/rounds`);
  return r.json();
}

export async function runRound(name: string, rounds: number, provers: number, temperature: number, preset: string) {
  const r = await req(`/problems_public/${encodeURIComponent(name)}/run`, {
    method: "POST",
    body: JSON.stringify({ rounds, provers, temperature, preset }),
  });
  return r.json();
}

export async function getStatus(name: string) {
  const r = await req(`/problems_public/${encodeURIComponent(name)}/status`);
  return r.json();
}

export async function stopProblem(name: string) {
  const r = await req(`/problems_public/${encodeURIComponent(name)}/stop`, {
    method: "POST"
  });
  return r.json();
}

export async function deleteRounds(name: string, deleteCount: number) {
  const r = await req(`/problems_public/${encodeURIComponent(name)}/rounds?delete_count=${deleteCount}`, {
    method: "DELETE"
  });
  return r.json();
}

export async function listFiles(name: string) {
  const r = await req(`/problems_public/${encodeURIComponent(name)}/files`);
  return r.json();
}

export async function getFileContent(name: string, filePath: string) {
  const r = await req(`/problems_public/${encodeURIComponent(name)}/file?file_path=${encodeURIComponent(filePath)}`);
  return r.json();
}

// Draft API functions
export async function listDrafts() {
  const r = await req(`/drafts_public`);
  return r.json();
}

export async function getDraftStatus(name: string) {
  const r = await req(`/drafts_public/${encodeURIComponent(name)}/status`);
  return r.json();
}

export async function getDraftDrafts(name: string) {
  const r = await req(`/drafts_public/${encodeURIComponent(name)}/drafts`);
  return r.json();
}

export async function runDraftWriting(name: string, rounds: number, preset: string) {
  const r = await req(`/drafts_public/${encodeURIComponent(name)}/start-writing`, {
    method: "POST",
    body: JSON.stringify({ rounds, preset }),
  });
  return r.json();
}

export async function getDraftRounds(name: string) {
  const r = await req(`/drafts_public/${encodeURIComponent(name)}/rounds`);
  return r.json();
}

export async function getDraftFiles(name: string) {
  const r = await req(`/drafts_public/${encodeURIComponent(name)}/files`);
  return r.json();
}

export async function getDraftFileContent(name: string, filePath: string) {
  const r = await req(`/drafts_public/${encodeURIComponent(name)}/file?file_path=${encodeURIComponent(filePath)}`);
  return r.json();
}

export async function deleteDraftRounds(name: string, deleteCount: number) {
  console.log('deleteDraftRounds API call', { name, deleteCount })
  const url = `/drafts_public/${encodeURIComponent(name)}/rounds?delete_count=${deleteCount}`
  console.log('DELETE URL:', url)
  const r = await req(url, {
    method: "DELETE"
  });
  console.log('DELETE response status:', r.status)
  const result = await r.json();
  console.log('DELETE response body:', result)
  return result;
}

// Task deletion API functions
export async function deleteProblem(problemName: string) {
  const r = await req(`/problems_public/${encodeURIComponent(problemName)}`, {
    method: "DELETE",
  });
  return r.json();
}

export async function deleteDraft(draftName: string) {
  const r = await req(`/drafts_public/${encodeURIComponent(draftName)}`, {
    method: "DELETE",
  });
  return r.json();
}

// Task creation API functions
export async function createProblem(name: string, taskDescription: string, taskType: string = "txt") {
  const r = await req(`/problems_public/create`, {
    method: "POST",
    body: JSON.stringify({ name, task_description: taskDescription, task_type: taskType }),
  });
  return r.json();
}

export async function createDraft(name: string, taskDescription: string) {
  const r = await req(`/drafts_public/create`, {
    method: "POST",
    body: JSON.stringify({ name, task_description: taskDescription, task_type: "tex" }),
  });
  return r.json();
}

// Paper management API functions
export async function uploadProblemPaper(problemName: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const r = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/problems_public/${encodeURIComponent(problemName)}/papers/upload`, {
    method: "POST",
    body: formData,
  });
  return r.json();
}

export async function uploadDraftPaper(draftName: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const r = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/drafts_public/${encodeURIComponent(draftName)}/papers/upload`, {
    method: "POST",
    body: formData,
  });
  return r.json();
}

export async function addProblemPaperFromUrl(problemName: string, url: string) {
  const r = await req(`/problems_public/${encodeURIComponent(problemName)}/papers/from-url`, {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  return r.json();
}

export async function addDraftPaperFromUrl(draftName: string, url: string) {
  const r = await req(`/drafts_public/${encodeURIComponent(draftName)}/papers/from-url`, {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  return r.json();
}

