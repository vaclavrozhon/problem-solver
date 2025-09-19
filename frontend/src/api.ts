import { supabase } from './config/supabase'

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function req(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // Get the current session and add JWT token to headers
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }

  const response = await fetch(`${BASE}${path}`, { ...opts, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response;
}

export async function listProblems() {
  try {
    console.log('🔍 API DEBUG: Making request to /problems')
    const r = await req(`/problems`);
    console.log('🔍 API DEBUG: Response status:', r.status)
    const data = await r.json();
    console.log('🔍 API DEBUG: Raw response data:', data)
    console.log('🔍 API DEBUG: Data type:', typeof data)
    console.log('🔍 API DEBUG: Is array:', Array.isArray(data))
    const result = Array.isArray(data) ? data : [];
    console.log('🔍 API DEBUG: Returning:', result)
    return result;
  } catch (error) {
    console.error('Failed to list problems:', error);
    return [];
  }
}

export async function getRounds(name: string) {
  const r = await req(`/problems/${encodeURIComponent(name)}/rounds`);
  return r.json();
}

export async function runRound(name: string, rounds: number, provers: number, temperature: number, preset: string, proverConfigs?: any[], focusDescription?: string, verifierConfig?: any) {
  // Don't send temperature for GPT-5 models (they only support default)
  const params: any = { rounds, provers, preset };
  if (preset !== 'gpt5') {
    params.temperature = temperature;
  }
  if (proverConfigs && proverConfigs.length > 0) {
    params.prover_configs = proverConfigs;
  }
  if (focusDescription && focusDescription.trim()) {
    params.focus_description = focusDescription.trim();
  }
  if (verifierConfig) {
    params.verifier_config = verifierConfig;
  }
  
  const r = await req(`/problems/${encodeURIComponent(name)}/run`, {
    method: "POST",
    body: JSON.stringify(params),
  });
  return r.json();
}

export async function getStatus(problemId: string) {
  const r = await req(`/problems/${encodeURIComponent(problemId)}/status`);
  return r.json();
}

export async function stopProblem(name: string) {
  const r = await req(`/problems/${encodeURIComponent(name)}/stop`, {
    method: "POST"
  });
  return r.json();
}

export async function deleteRounds(name: string, deleteCount: number) {
  const r = await req(`/problems/${encodeURIComponent(name)}/rounds?delete_count=${deleteCount}`, {
    method: "DELETE"
  });
  return r.json();
}

export async function deleteRound(problemName: string, roundName: string) {
  const r = await req(`/problems/${encodeURIComponent(problemName)}/rounds/${encodeURIComponent(roundName)}`, {
    method: "DELETE"
  });
  return r.json();
}

export async function listFiles(name: string) {
  try {
    const r = await req(`/problems/${encodeURIComponent(name)}/files`);
    const data = await r.json();
    // Backend returns {files: [...], total: N, filters: {...}}
    // Frontend expects just the files array
    return Array.isArray(data) ? data : (data.files || []);
  } catch (error) {
    console.error('Failed to list files:', error);
    return [];
  }
}

export async function getFileContent(name: string, filePath: string, version?: string) {
  let url = `/problems/${encodeURIComponent(name)}/file?file_path=${encodeURIComponent(filePath)}`;
  if (version) {
    url += `&version=${encodeURIComponent(version)}`;
  }
  const r = await req(url);
  return r.json();
}

export async function getFileVersions(name: string, filePath: string) {
  const r = await req(`/problems/${encodeURIComponent(name)}/file-versions?file_path=${encodeURIComponent(filePath)}`);
  return r.json();
}

// Draft API functions
export async function listDrafts() {
  try {
    const r = await req(`/drafts`);
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to list drafts:', error);
    return [];
  }
}

export async function getDraftStatus(draftId: string) {
  const r = await req(`/drafts/${encodeURIComponent(draftId)}/status`);
  return r.json();
}

export async function getDraftDrafts(name: string) {
  const r = await req(`/drafts/${encodeURIComponent(name)}/drafts`);
  return r.json();
}

export async function runDraftWriting(name: string, rounds: number, preset: string) {
  const r = await req(`/drafts/${encodeURIComponent(name)}/start-writing`, {
    method: "POST",
    body: JSON.stringify({ rounds, preset }),
  });
  return r.json();
}

export async function getDraftRounds(name: string) {
  const r = await req(`/drafts/${encodeURIComponent(name)}/rounds`);
  return r.json();
}

export async function getDraftFiles(name: string) {
  const r = await req(`/drafts/${encodeURIComponent(name)}/files`);
  return r.json();
}

export async function getDraftFileContent(name: string, filePath: string) {
  const r = await req(`/drafts/${encodeURIComponent(name)}/file?file_path=${encodeURIComponent(filePath)}`);
  return r.json();
}

export async function deleteDraftRounds(name: string, deleteCount: number) {
  const r = await req(`/drafts/${encodeURIComponent(name)}/rounds?delete_count=${deleteCount}`, {
    method: "DELETE"
  });
  return r.json();
}

// Task deletion API functions
export async function deleteProblem(problemName: string) {
  const r = await req(`/problems/${encodeURIComponent(problemName)}`, {
    method: "DELETE",
  });
  return r.json();
}

export async function resetProblem(problemName: string) {
  const r = await req(`/problems/${encodeURIComponent(problemName)}/reset`, {
    method: "POST",
  });
  return r.json();
}

export async function deleteDraft(draftName: string) {
  const r = await req(`/drafts/${encodeURIComponent(draftName)}`, {
    method: "DELETE",
  });
  return r.json();
}

// Task creation API functions
export async function createProblem(name: string, taskDescription: string, taskType: string = "txt") {
  const r = await req(`/tasks/problems/create`, {
    method: "POST",
    body: JSON.stringify({ name, task_description: taskDescription, task_type: taskType }),
  });
  return r.json();
}

export async function createDraft(name: string, taskDescription: string, initialDraft: string) {
  const r = await req(`/tasks/drafts/create`, {
    method: "POST",
    body: JSON.stringify({
      name,
      task_description: taskDescription,
      initial_draft: initialDraft
    }),
  });
  return r.json();
}

// Paper management API functions
export async function uploadProblemPaper(problemName: string, file: File, description: string = '') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);
  
  // Get the current session and add JWT token to headers
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = {}
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }
  
  const r = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/problems/${encodeURIComponent(problemName)}/papers/upload`, {
    method: "POST",
    body: formData,
    headers,
  });
  return r.json();
}

export async function uploadDraftPaper(draftName: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  // Get the current session and add JWT token to headers
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = {}
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }
  
  const r = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/drafts/${encodeURIComponent(draftName)}/papers/upload`, {
    method: "POST",
    body: formData,
    headers,
  });
  return r.json();
}

export async function addProblemPaperFromUrl(problemName: string, url: string) {
  const r = await req(`/problems/${encodeURIComponent(problemName)}/papers/from-url`, {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  return r.json();
}

export async function addDraftPaperFromUrl(draftName: string, url: string) {
  const r = await req(`/drafts/${encodeURIComponent(draftName)}/papers/from-url`, {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  return r.json();
}

// Text content upload functions
export async function uploadProblemTextContent(problemName: string, content: string, filename: string, description?: string) {
  // Create a blob and file from text content to upload as file
  const blob = new Blob([content], { type: 'text/plain' });
  const file = new File([blob], filename, { type: 'text/plain' });
  
  const formData = new FormData();
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }
  
  // Get the current session and add JWT token to headers
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = {}
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }
  
  const r = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/problems/${encodeURIComponent(problemName)}/papers/upload`, {
    method: "POST",
    body: formData,
    headers,
  });
  return r.json();
}

export async function uploadDraftTextContent(draftName: string, content: string, filename: string, description?: string) {
  // Create a blob and file from text content to upload as file
  const blob = new Blob([content], { type: 'text/plain' });
  const file = new File([blob], filename, { type: 'text/plain' });
  
  const formData = new FormData();
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }
  
  // Get the current session and add JWT token to headers
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = {}
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }
  
  const r = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/drafts/${encodeURIComponent(draftName)}/papers/upload`, {
    method: "POST",
    body: formData,
    headers,
  });
  return r.json();
}

