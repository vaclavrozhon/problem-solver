import React, { useEffect, useState } from 'react'
import { listProblems, getStatus } from '../api'
import { Link } from 'react-router-dom'

interface ProblemSummary {
  name: string
  hasTask: boolean
  hasOutput: boolean
  totalRounds: number
  lastActivity: string
  status: 'idle' | 'running' | 'error'
}

export default function OverviewPage() {
  const [problems, setProblems] = useState<ProblemSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showQuickStart, setShowQuickStart] = useState(() => {
    // Check localStorage for user's preference
    const saved = localStorage.getItem('hideQuickStartGuide')
    return saved !== 'true' // Show by default, hide if explicitly set to 'true'
  })

  async function refresh() {
    if (isInitialLoad) {
      setLoading(true)
    }
    try {
      // Load problems with status in a single API call
      const problemsList = await listProblems(true) || []
      const problemSummaries: ProblemSummary[] = []

      // Process problems with their included status
      for (const problem of problemsList) {
        const name = problem.name || problem.id
        if (!name) {
          console.error('Problem has no name:', problem)
          continue
        }

        // Use the status included in the response
        const status = problem.status
        if (status) {
          const isRunning = status.is_running || false
          const hasError = false // Not available in simplified status
          const roundCount = status.rounds_count || 0
          const lastActivity = status.last_activity
            ? new Date(status.last_activity).toLocaleString()
            : 'Never'

          problemSummaries.push({
            name,
            hasTask: true, // Assume all have tasks for now
            hasOutput: false, // Would need to check files
            totalRounds: roundCount,
            lastActivity,
            status: hasError ? 'error' : (isRunning ? 'running' : 'idle')
          })
        } else {
          // No status info - use defaults
          problemSummaries.push({
            name,
            hasTask: true,
            hasOutput: false,
            totalRounds: 0,
            lastActivity: 'Never',
            status: 'idle'
          })
        }
      }

      setProblems(problemSummaries)
    } catch (err) {
      console.error('Failed to load problems:', err)
    } finally {
      if (isInitialLoad) {
        setLoading(false)
        setIsInitialLoad(false)
      }
    }
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000) // Auto-refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const hideQuickStartGuide = () => {
    setShowQuickStart(false)
    localStorage.setItem('hideQuickStartGuide', 'true')
  }

  // Metrics for solving tasks (problems)
  const problemRunningCount = problems.filter(p => p.status === 'running').length
  const problemTotalRounds = problems.reduce((sum, p) => sum + p.totalRounds, 0)

  return (
    <div>
      {/* Quick Start Guide */}
      {showQuickStart && (
        <div className="problem-card" style={{ marginBottom: '30px', position: 'relative' }}>
          <button
            onClick={hideQuickStartGuide}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '5px',
              borderRadius: '4px',
              lineHeight: '1'
            }}
            title="Hide Quick Start Guide permanently"
          >
            ×
          </button>
          <h3>🚀 Quick Start Guide</h3>
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: '#2563eb', marginBottom: '15px' }}>🧠 Problem Solving</h4>
            <ol style={{ marginLeft: '20px', lineHeight: '1.6' }}>
              <li>Go to <strong>Create Task</strong> page and create a new research problem</li>
              <li>Add a detailed description of the research problem</li>
              <li>Click <strong>"Solve"</strong> to run automated research rounds</li>
              <li>Monitor progress and review outputs in real-time</li>
              <li>Access results in <code>output.md</code> and <code>progress.md</code></li>
            </ol>
          </div>
        </div>
      )}

      {/* Dashboard metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Problems</div>
          <div className="metric-value">{problems.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Currently Running</div>
          <div className="metric-value">{problemRunningCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Rounds</div>
          <div className="metric-value">{problemTotalRounds}</div>
        </div>
      </div>

      {/* Solving Tasks table */}
      <div style={{ marginTop: '30px' }}>
        <h3>🧠 Problem Solving Tasks ({problems.length})</h3>
        
        {loading && isInitialLoad && problems.length === 0 ? (
          <div className="spinner" style={{ marginTop: '20px' }}></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Problem</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Rounds</th>
                  <th style={{ padding: '12px' }}>Last Activity</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map(p => (
                  <tr key={p.name} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>
                      <strong>{p.name}</strong>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div className="status-indicator">
                        <span className={`status-dot ${p.status === 'running' ? 'running' : 'stopped'}`}></span>
                        <span>{p.status === 'running' ? 'Running' : 'Idle'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {p.totalRounds}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="small-font">{p.lastActivity}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/solve?problem=${p.name}`}>
                          <button className="btn btn-sm btn-primary">Solve</button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {problems.length === 0 && !isInitialLoad && (
          <div style={{ textAlign: 'center', color: '#6c757d', marginTop: '50px' }}>
            <p>No research problems found.</p>
            <p>
              <Link to="/create" style={{ color: '#2563eb', textDecoration: 'none' }}>
                <strong>Create a new research problem</strong>
              </Link> to get started with problem solving.
            </p>
          </div>
        )}
      </div>


    </div>
  )
}

