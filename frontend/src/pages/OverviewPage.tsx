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

  async function refresh() {
    setLoading(true)
    try {
      const names = await listProblems()
      const summaries: ProblemSummary[] = []
      
      for (const name of names) {
        try {
          const status = await getStatus(name)
          const isRunning = status.phase !== 'idle' && Date.now() - (status.ts * 1000) < 600000
          
          summaries.push({
            name,
            hasTask: true, // Assume all have tasks for now
            hasOutput: false, // Would need to check files
            totalRounds: status.round || 0,
            lastActivity: status.ts ? new Date(status.ts * 1000).toLocaleString() : 'Never',
            status: isRunning ? 'running' : 'idle'
          })
        } catch {
          summaries.push({
            name,
            hasTask: true,
            hasOutput: false,
            totalRounds: 0,
            lastActivity: 'Never',
            status: 'idle'
          })
        }
      }
      
      setProblems(summaries)
    } catch (err) {
      console.error('Failed to load problems:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    refresh()
    const interval = setInterval(refresh, 5000) // Auto-refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const runningCount = problems.filter(p => p.status === 'running').length
  const totalRounds = problems.reduce((sum, p) => sum + p.totalRounds, 0)
  const withProgress = problems.filter(p => p.totalRounds > 0).length

  return (
    <div>
      {/* Dashboard metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Problems</div>
          <div className="metric-value">{problems.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Currently Running</div>
          <div className="metric-value">{runningCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Rounds</div>
          <div className="metric-value">{totalRounds}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">With Progress</div>
          <div className="metric-value">{withProgress}</div>
        </div>
      </div>

      {/* Problems table */}
      <div style={{ marginTop: '30px' }}>
        <h3>All Problems</h3>
        
        {loading && problems.length === 0 ? (
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
                        <Link to={`/write?problem=${p.name}`}>
                          <button className="btn btn-sm btn-secondary">Write</button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {problems.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: '#6c757d', marginTop: '50px' }}>
            <p>No problems found in the problems/ directory.</p>
            <p>Create a new problem directory with a task.md file to get started.</p>
          </div>
        )}
      </div>

      {/* Quick start guide */}
      <div className="problem-card" style={{ marginTop: '40px' }}>
        <h4>Quick Start Guide</h4>
        <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Create a directory in <code>problems/</code> with your problem name</li>
          <li>Add a <code>task.md</code> file describing the research problem</li>
          <li>Click "Solve" to run research rounds with prover and verifier agents</li>
          <li>Review outputs in <code>output.md</code> and <code>progress.md</code></li>
          <li>Click "Write" to generate a formal paper from your research</li>
        </ol>
      </div>
    </div>
  )
}

