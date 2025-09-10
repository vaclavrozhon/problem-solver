import React, { useEffect, useState } from 'react'
import { listProblems, getStatus, listDrafts, getDraftStatus } from '../api'
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
  const [drafts, setDrafts] = useState<ProblemSummary[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      // Load problems (solving tasks)
      const problemNames = await listProblems()
      const problemSummaries: ProblemSummary[] = []
      
      for (const name of problemNames) {
        try {
          const status = await getStatus(name)
          const isRunning = status.overall?.is_running || (status.phase !== 'idle' && Date.now() - (status.ts * 1000) < 600000)
          const hasError = status.overall?.error || status.error
          const roundCount = status.rounds?.length || 0
          
          problemSummaries.push({
            name,
            hasTask: true, // Assume all have tasks for now
            hasOutput: false, // Would need to check files
            totalRounds: roundCount,
            lastActivity: status.overall?.timestamp ? new Date(status.overall.timestamp * 1000).toLocaleString() : (status.ts ? new Date(status.ts * 1000).toLocaleString() : 'Never'),
            status: hasError ? 'error' : (isRunning ? 'running' : 'idle')
          })
        } catch {
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
      
      // Load drafts (writing tasks)
      const draftNames = await listDrafts()
      const draftSummaries: ProblemSummary[] = []
      
      for (const name of draftNames) {
        try {
          const status = await getDraftStatus(name)
          const isRunning = status.overall?.is_running || (status.phase !== 'idle' && Date.now() - (status.ts * 1000) < 600000)
          const hasError = status.overall?.error || status.error
          const roundCount = status.rounds?.length || 0
          
          draftSummaries.push({
            name,
            hasTask: true, // Assume all have drafts
            hasOutput: false, // Would need to check files
            totalRounds: roundCount,
            lastActivity: status.overall?.timestamp ? new Date(status.overall.timestamp * 1000).toLocaleString() : (status.ts ? new Date(status.ts * 1000).toLocaleString() : 'Never'),
            status: hasError ? 'error' : (isRunning ? 'running' : 'idle')
          })
        } catch {
          draftSummaries.push({
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
      setDrafts(draftSummaries)
    } catch (err) {
      console.error('Failed to load problems and drafts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    refresh()
    const interval = setInterval(refresh, 5000) // Auto-refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  // Metrics for solving tasks (problems)
  const problemRunningCount = problems.filter(p => p.status === 'running').length
  const problemTotalRounds = problems.reduce((sum, p) => sum + p.totalRounds, 0)
  
  // Metrics for writing tasks (drafts)
  const draftRunningCount = drafts.filter(d => d.status === 'running').length
  const draftTotalRounds = drafts.reduce((sum, d) => sum + d.totalRounds, 0)
  
  // Combined metrics
  const totalRunning = problemRunningCount + draftRunningCount
  const totalRounds = problemTotalRounds + draftTotalRounds

  return (
    <div>
      {/* Dashboard metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Solving Tasks</div>
          <div className="metric-value">{problems.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Writing Tasks</div>
          <div className="metric-value">{drafts.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Currently Running</div>
          <div className="metric-value">{totalRunning}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Rounds</div>
          <div className="metric-value">{totalRounds}</div>
        </div>
      </div>

      {/* Solving Tasks table */}
      <div style={{ marginTop: '30px' }}>
        <h3>🧠 Problem Solving Tasks ({problems.length})</h3>
        
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

      {/* Writing Tasks table */}
      <div style={{ marginTop: '40px' }}>
        <h3>📝 Paper Writing Tasks ({drafts.length})</h3>
        
        {loading && drafts.length === 0 ? (
          <div className="spinner" style={{ marginTop: '20px' }}></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Draft Project</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Rounds</th>
                  <th style={{ padding: '12px' }}>Last Activity</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map(d => (
                  <tr key={d.name} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>
                      <strong>{d.name}</strong>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div className="status-indicator">
                        <span className={`status-dot ${d.status === 'running' ? 'running' : 'stopped'}`}></span>
                        <span>{d.status === 'running' ? 'Running' : 'Idle'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {d.totalRounds}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="small-font">{d.lastActivity}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Link to={`/write?problem=${d.name}`}>
                        <button className="btn btn-sm btn-primary">Write Paper</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {drafts.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: '#6c757d', marginTop: '50px' }}>
            <p>No drafts found in the drafts/ directory.</p>
            <p>Create a new draft directory to get started with paper writing.</p>
          </div>
        )}
      </div>

      {/* Quick start guide */}
      <div className="problem-card" style={{ marginTop: '40px' }}>
        <h4>Quick Start Guide</h4>
        <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li><strong>Problem Solving:</strong> Create a directory in <code>problems/</code> with your problem name</li>
          <li>Add a <code>task.md</code> file describing the research problem</li>
          <li>Click "Solve" to run research rounds with prover and verifier agents</li>
          <li>Review outputs in <code>output.md</code> and <code>progress.md</code></li>
          <li><strong>Paper Writing:</strong> Create a directory in <code>drafts/</code> for paper projects</li>
          <li>Click "Write Paper" to generate formal papers from research or drafts</li>
        </ol>
      </div>
    </div>
  )
}

