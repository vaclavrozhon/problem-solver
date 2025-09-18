// API service for authenticated requests

interface Problem {
  id: number;
  name: string;
  status: string;
  current_round: number;
  total_rounds: number;
  total_cost: number;
  created_at: string;
  updated_at?: string;
}

interface CreateProblemPayload {
  name: string;
  task_description: string;
  task_type?: string;
}

interface RunParams {
  rounds: number;
  provers: number;
  temperature: number;
  preset: string;
  prover_configs?: any[];
  focus_description?: string;
}

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.reload();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Problem management
  async getProblems(): Promise<Problem[]> {
    const response = await fetch('/problems', {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Problem[]>(response);
  }

  async createProblem(payload: CreateProblemPayload): Promise<{ id: number; name: string; message: string }> {
    const response = await fetch('/problems', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  async getProblem(problemId: number): Promise<Problem & { task_description: string; task_type: string }> {
    const response = await fetch(`/problems/${problemId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async runProblem(problemId: number, params: RunParams): Promise<{ ok: boolean; message: string; estimated_cost: number }> {
    const response = await fetch(`/problems/${problemId}/run`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse(response);
  }

  // User/Auth management
  async getCurrentUser(): Promise<any> {
    const response = await fetch('/auth/me', {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getCredits(): Promise<{
    balance: number;
    spent: number;
    transactions: Array<{
      id: number;
      amount: number;
      type: string;
      description: string;
      created_at: string;
      tokens_used?: number;
      model_used?: string;
    }>;
  }> {
    const response = await fetch('/auth/credits', {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Public endpoints (no auth required)
  async getPublicProblems(): Promise<string[]> {
    const response = await fetch('/problems/public');
    return this.handleResponse<string[]>(response);
  }

  async getPublicProblemStatus(problem: string): Promise<any> {
    const response = await fetch(`/problems/public/${problem}/status`);
    return this.handleResponse(response);
  }

  async runPublicProblem(problem: string, params: RunParams): Promise<{ ok: boolean; pid: number }> {
    const response = await fetch(`/problems/public/${problem}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiService();
export type { Problem, CreateProblemPayload, RunParams };