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
      // Load problems (solving tasks)
      const problemsList = await listProblems() || []
      console.log('🔍 FRONTEND DEBUG: problemsList =', problemsList)
      console.log('🔍 FRONTEND DEBUG: problemsList type =', typeof problemsList)
      console.log('🔍 FRONTEND DEBUG: problemsList length =', problemsList.length)
      const problemSummaries: ProblemSummary[] = []

      for (const problem of problemsList) {
        const name = problem.name || problem.id
        const problemId = problem.id
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
      const draftsList = await listDrafts() || []
      const draftSummaries: ProblemSummary[] = []

      for (const draft of draftsList) {
        const name = draft.name || draft.id
        const draftId = draft.id
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
  
  // Metrics for writing tasks (drafts)
  const draftRunningCount = drafts.filter(d => d.status === 'running').length
  const draftTotalRounds = drafts.reduce((sum, d) => sum + d.totalRounds, 0)
  
  // Combined metrics
  const totalRunning = problemRunningCount + draftRunningCount
  const totalRounds = problemTotalRounds + draftTotalRounds

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
            <div>
              <h4 style={{ color: '#2563eb', marginBottom: '15px' }}>🧠 Problem Solving</h4>
              <ol style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                <li>Go to <strong>Create Task</strong> page and create a new research problem</li>
                <li>Add a detailed description of the research problem</li>
                <li>Click <strong>"Solve"</strong> to run automated research rounds</li>
                <li>Monitor progress and review outputs in real-time</li>
                <li>Access results in <code>output.md</code> and <code>progress.md</code></li>
              </ol>
            </div>
            <div>
              <h4 style={{ color: '#059669', marginBottom: '15px' }}>📝 Paper Writing</h4>
              <ol style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                <li>Go to <strong>Create Task</strong> page and create a new paper writing project</li>
                <li>Add your research materials or draft content</li>
                <li>Go to <strong>Paper Writing</strong> tab to access your project</li>
                <li>Click <strong>"Write Paper"</strong> to generate formal academic papers</li>
                <li>Review and iterate on generated drafts</li>
              </ol>
            </div>
          </div>
        </div>
      )}

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
            <p>No problems found in the problems/ directory.</p>
            <p>Create a new problem directory with a task.md file to get started.</p>
          </div>
        )}
      </div>

      {/* Writing Tasks table */}
      <div style={{ marginTop: '40px' }}>
        <h3>📝 Paper Writing Tasks ({drafts.length})</h3>
        
        {loading && isInitialLoad && drafts.length === 0 ? (
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

        {drafts.length === 0 && !isInitialLoad && (
          <div style={{ textAlign: 'center', color: '#6c757d', marginTop: '50px' }}>
            <p>No drafts found in the drafts/ directory.</p>
            <p>Create a new draft directory to get started with paper writing.</p>
          </div>
        )}
      </div>

    </div>
  )
}

