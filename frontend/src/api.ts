import { supabase } from './config/supabase'

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function req(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // Get the current session and add JWT token to headers
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }

  const response = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      ...(opts.headers as Record<string, string> || {}),
      ...headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
    const detail = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail ?? errorData);
    throw new Error(detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response;
}

export async function listProblems(includeStatus: boolean = false) {
  try {
    const url = includeStatus ? `/problems/?include_status=true` : `/problems/`;
    const r = await req(url);
    const data = await r.json();
    const result = Array.isArray(data) ? data : [];
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

export async function runRound(name: string, rounds: number, provers: number, _temperature: number, preset: string, proverConfigs?: any[], focusDescription?: string, verifierConfig?: any, summarizerModel?: string) {
  // Temperature not used for GPT-5 models
  const params: any = { rounds, provers, preset };
  // Send only DB-based fields. Missing fields are treated as empty server-side.
  if (proverConfigs && proverConfigs.length > 0) {
    params.prover_directives = proverConfigs;
  }
  if (focusDescription && focusDescription.trim()) {
    params.user_specification = focusDescription.trim();
  }
  if (verifierConfig) {
    params.verifier_config = verifierConfig;
  }
  if (summarizerModel) {
    params.summarizer_model = summarizerModel;
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

export async function getAllProblemsStatus() {
  const r = await req(`/problems/all-status`);
  return r.json();
}

export async function stopProblem(name: string) {
  const r = await req(`/problems/${encodeURIComponent(name)}/stop`, {
    method: "POST"
  });
  return r.json();
}

// Profile API
export async function getCredits() {
  const r = await req(`/profile/credits`);
  return r.json();
}

export async function deleteRounds(name: string, deleteCount: number) {
  const r = await req(`/problems/${encodeURIComponent(name)}/rounds?delete_count=${deleteCount}`, {
    method: "DELETE"
  });
  return r.json();
}

export async function deleteRound(problemName: string, roundName: string) {
  // Single-round deletion maps to "delete last N rounds" with N=1
  const r = await req(`/problems/${encodeURIComponent(problemName)}/rounds?delete_count=1`, {
    method: "DELETE"
  });
  return r.json();
}

export async function listFiles(name: string) {
  try {
    const r = await req(`/problems/${encodeURIComponent(name)}/files`);
    const data = await r.json();
    const files = Array.isArray(data) ? data : (data.files || []);
    // Preserve original DB fields (file_type, round, file_name, created_at, metadata, content)
    // and add UI helper fields used by components (name, path, type, size, modified, description)
    const mapType = (ft: string, fn: string) => {
      if (ft === 'paper') return 'paper';
      if (fn.endsWith('.md')) return 'markdown';
      return 'text';
    };
    return (files || []).map((f: any) => ({
      ...f,
      name: f.file_name || f.file_type || 'unknown',
      // FilesPanel expects to pass file_type into the content API
      path: f.file_type || f.file_name || 'unknown',
      type: mapType(f.file_type, f.file_name || ''),
      size: (f.content ? String(f.content).length : 0),
      modified: f.created_at || '',
      description: (f.metadata && f.metadata.description) || undefined,
    }));
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

export async function updateBaseFileByName(problemName: string, fileType: 'task'|'notes'|'proofs'|'output', content: string, description?: string) {
  const params: any = { content };
  if (description !== undefined) params.description = description;
  const r = await req(`/problems/${encodeURIComponent(problemName)}/files/${encodeURIComponent(fileType)}?round=0`, {
    method: 'PUT',
    body: JSON.stringify(params)
  });
  return r.json();
}

// DB-only helpers
export async function getProblemFilesRaw(name: string, filters?: { round?: number; file_type?: string }) {
  const params = new URLSearchParams();
  if (filters?.round !== undefined) params.set('round', String(filters.round));
  if (filters?.file_type) params.set('file_type', filters.file_type);
  const path = `/problems/${encodeURIComponent(name)}/files${params.toString() ? `?${params.toString()}` : ''}`;
  const r = await req(path);
  const data = await r.json();
  return Array.isArray(data) ? data : (data.files || []);
}

export async function getPromptForRound(problemName: string, roundNum: number, agentName: string) {
  // Fetch prover prompts for the round from DB and return matching agent prompt content
  const files = await getProblemFilesRaw(problemName, { round: roundNum, file_type: 'prover_prompt' });
  const expected = `${agentName}.prompt.txt`;
  const match = (files || []).find((f: any) => (f.file_name || '').toLowerCase() === expected.toLowerCase());
  const chosen = match || (files && files[0]);
  return chosen?.content || '';
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

// Task creation API functions
export async function createProblem(name: string, taskDescription: string, taskType: string = "txt") {
  const r = await req(`/tasks/problems/create`, {
    method: "POST",
    body: JSON.stringify({ name, task_description: taskDescription, task_type: taskType }),
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

// Drafts are no longer supported

export async function addProblemPaperFromUrl(problemName: string, url: string) {
  const r = await req(`/problems/${encodeURIComponent(problemName)}/papers/from-url`, {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  return r.json();
}

// Drafts are no longer supported

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

// Drafts are no longer supported

