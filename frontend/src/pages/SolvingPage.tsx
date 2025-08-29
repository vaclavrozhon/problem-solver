import React, { useEffect, useState, useCallback } from 'react'
import { listProblems, runRound, getStatus, stopProblem } from '../api'

interface ProblemStatus {
  phase: string
  round: number
  ts: number
  verdict?: string
  blocking_issues?: string[]
  models?: any
}

interface ProblemInfo {
  name: string
  status: 'running' | 'stopped' | 'error'
  currentRound: number
  totalRounds: number
  lastVerdict?: string
}

export default function SolvingPage() {
  const [problems, setProblems] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [rounds, setRounds] = useState(5)
  const [provers, setProvers] = useState(2)
  const [temperature, setTemperature] = useState(0.4)
  const [preset, setPreset] = useState('gpt5')
  const [statusMap, setStatusMap] = useState<Record<string, ProblemStatus>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Model presets matching web_app.py
  const modelPresets = {
    gpt5: { label: 'GPT-5 (default)', value: 'gpt5' },
    fast: { label: 'Fast (test)', value: 'fast' },
  }

  // Load problems on mount
  useEffect(() => {
    loadProblems()
  }, [])

  // Auto-refresh status
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      problems.forEach(p => {
        getStatus(p).then(s => {
          setStatusMap(prev => ({ ...prev, [p]: s }))
        }).catch(() => {})
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [problems, autoRefresh])

  async function loadProblems() {
    try {
      const probs = await listProblems()
      setProblems(probs)
      // Load initial status for all problems
      probs.forEach(p => {
        getStatus(p).then(s => {
          setStatusMap(prev => ({ ...prev, [p]: s }))
        }).catch(() => {})
      })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load problems' })
    }
  }

  function getProblemInfo(problem: string): ProblemInfo {
    const status = statusMap[problem]
    if (!status) {
      return { name: problem, status: 'stopped', currentRound: 0, totalRounds: 0 }
    }
    
    const isRunning = status.phase !== 'idle' && Date.now() - (status.ts * 1000) < 600000
    return {
      name: problem,
      status: isRunning ? 'running' : 'stopped',
      currentRound: status.round || 0,
      totalRounds: 0, // Would need to track this separately
      lastVerdict: status.verdict
    }
  }

  async function handleRun() {
    if (!selected) return
    setLoading(true)
    setMessage(null)
    try {
      await runRound(selected, rounds, provers, temperature, preset)
      setMessage({ type: 'success', text: `Started ${rounds} rounds for ${selected}` })
      // Refresh status
      setTimeout(() => {
        getStatus(selected).then(s => {
          setStatusMap(prev => ({ ...prev, [selected]: s }))
        })
      }, 1000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to start rounds' })
    } finally {
      setLoading(false)
    }
  }

  async function handleStop() {
    if (!selected) return
    setLoading(true)
    try {
      await stopProblem(selected)
      setMessage({ type: 'success', text: `Stopped ${selected}` })
      // Refresh status
      setTimeout(() => {
        getStatus(selected).then(s => {
          setStatusMap(prev => ({ ...prev, [selected]: s }))
        })
      }, 1000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to stop problem' })
    } finally {
      setLoading(false)
    }
  }

  async function handleStopAll() {
    setLoading(true)
    let stoppedCount = 0
    for (const problem of problems) {
      const info = getProblemInfo(problem)
      if (info.status === 'running') {
        try {
          await stopProblem(problem)
          stoppedCount++
        } catch (err) {
          console.error(`Failed to stop ${problem}:`, err)
        }
      }
    }
    setMessage({ 
      type: stoppedCount > 0 ? 'success' : 'info', 
      text: stoppedCount > 0 
        ? `Stopped ${stoppedCount} problem${stoppedCount !== 1 ? 's' : ''}`
        : 'No running problems to stop'
    })
    setLoading(false)
    // Refresh all statuses
    loadProblems()
  }

  const runningCount = problems.filter(p => getProblemInfo(p).status === 'running').length
  const totalRounds = problems.reduce((sum, p) => sum + getProblemInfo(p).currentRound, 0)

  return (
    <div>
      {/* Metrics */}
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
          <div className="metric-label">Auto Refresh</div>
          <div className="metric-value">
            <button 
              className={`btn btn-sm ${autoRefresh ? 'btn-success' : 'btn-secondary'}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Global controls */}
      <div className="control-buttons" style={{ marginBottom: '20px' }}>
        <button className="btn btn-danger" onClick={handleStopAll} disabled={loading || runningCount === 0}>
          ⏹ Stop All
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Two column layout */}
      <div className="two-column-layout">
        <div className="sidebar">
          <h3>Problems</h3>
          <ul className="problem-list">
            {problems.map(p => {
              const info = getProblemInfo(p)
              return (
                <li 
                  key={p}
                  className={`problem-item ${selected === p ? 'selected' : ''}`}
                  onClick={() => setSelected(p)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`status-dot ${info.status}`}></span>
                    <span>{p}</span>
                  </div>
                  {info.status === 'running' && (
                    <span className="small-font">Round {info.currentRound}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="main-content">
          {selected ? (
            <>
              <h3>{selected}</h3>
              
              {/* Problem status */}
              {statusMap[selected] && (
                <div className="problem-card" style={{ marginBottom: '20px' }}>
                  <div className="status-indicator">
                    <span className={`status-dot ${getProblemInfo(selected).status}`}></span>
                    <span>Status: {getProblemInfo(selected).status}</span>
                  </div>
                  {statusMap[selected].phase && (
                    <div>Phase: {statusMap[selected].phase}</div>
                  )}
                  {statusMap[selected].round > 0 && (
                    <div>Current Round: {statusMap[selected].round}</div>
                  )}
                  {statusMap[selected].verdict && (
                    <div>
                      Last Verdict: <span className={`verdict-${statusMap[selected].verdict}`}>
                        {statusMap[selected].verdict}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div style={{ marginBottom: '20px' }}>
                <div className="input-group">
                  <label>Model Preset</label>
                  <select value={preset} onChange={e => setPreset(e.target.value)}>
                    {Object.entries(modelPresets).map(([key, val]) => (
                      <option key={key} value={val.value}>{val.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group">
                  <label>Rounds</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={100}
                    value={rounds} 
                    onChange={e => setRounds(parseInt(e.target.value || '1'))}
                  />
                  
                  <label>Provers</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={provers} 
                    onChange={e => setProvers(parseInt(e.target.value || '2'))}
                  />
                  
                  <label>Temperature</label>
                  <input 
                    type="number" 
                    step={0.05} 
                    min={0} 
                    max={1} 
                    value={temperature} 
                    onChange={e => setTemperature(parseFloat(e.target.value || '0.4'))}
                  />
                </div>

                <div className="control-buttons">
                  {getProblemInfo(selected).status === 'running' ? (
                    <>
                      <button 
                        className="btn btn-danger" 
                        onClick={handleStop}
                        disabled={loading}
                      >
                        ⏹ Stop
                      </button>
                      <button 
                        className="btn btn-primary" 
                        disabled
                      >
                        ➕ Queue More Rounds (TODO)
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn btn-success" 
                      onClick={handleRun}
                      disabled={loading}
                    >
                      ▶ Run {rounds} Rounds
                    </button>
                  )}
                </div>
              </div>

              {/* Status details */}
              <div className="pane">
                <pre>{JSON.stringify(statusMap[selected] || {}, null, 2)}</pre>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#6c757d', marginTop: '100px' }}>
              Select a problem from the list to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}