import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Problem, CreateProblemPayload, RunParams } from '../services/api';

const UserProblemsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateProblemPayload>({
    name: '',
    task_description: '',
    task_type: 'txt'
  });

  useEffect(() => {
    if (user && token) {
      loadProblems();
    }
  }, [user, token]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await api.getProblems();
      setProblems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProblem(createForm);
      setShowCreateForm(false);
      setCreateForm({ name: '', task_description: '', task_type: 'txt' });
      await loadProblems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create problem');
    }
  };

  const handleRunProblem = async (problemId: number) => {
    try {
      const params: RunParams = {
        rounds: 3,
        provers: 2,
        temperature: 0.4,
        preset: 'gpt5'
      };

      const result = await api.runProblem(problemId, params);
      alert(`Started research: ${result.message} (Estimated cost: $${result.estimated_cost})`);
      await loadProblems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start research');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading your problems...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Research Problems</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Problem
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Research Problem</h2>
          <form onSubmit={handleCreateProblem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Name
              </label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Description
              </label>
              <textarea
                value={createForm.task_description}
                onChange={(e) => setCreateForm({ ...createForm, task_description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
              <select
                value={createForm.task_type}
                onChange={(e) => setCreateForm({ ...createForm, task_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="txt">Plain Text</option>
                <option value="md">Markdown</option>
                <option value="tex">LaTeX</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Problem
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {problems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No research problems yet.</p>
            <p className="text-gray-400 text-sm mt-1">Create your first problem to get started!</p>
          </div>
        ) : (
          problems.map((problem) => (
            <div key={problem.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{problem.name}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      problem.status === 'idle' ? 'bg-gray-100 text-gray-800' :
                      problem.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      problem.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {problem.status}
                    </span>
                    <span>Round {problem.current_round}/{problem.total_rounds}</span>
                    <span>Cost: ${problem.total_cost.toFixed(2)}</span>
                    <span>{new Date(problem.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRunProblem(problem.id)}
                    disabled={problem.status === 'running'}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {problem.status === 'running' ? 'Running...' : 'Start Research'}
                  </button>
                  <button
                    onClick={() => setSelectedProblem(problem)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProblem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{selectedProblem.name}</h2>
              <button
                onClick={() => setSelectedProblem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProblem.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Progress</label>
                <p className="mt-1 text-sm text-gray-900">
                  Round {selectedProblem.current_round} of {selectedProblem.total_rounds}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Cost</label>
                <p className="mt-1 text-sm text-gray-900">${selectedProblem.total_cost.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedProblem.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProblemsPage;