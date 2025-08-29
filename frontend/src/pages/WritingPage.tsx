import React, { useEffect, useState } from 'react'
import { listProblems, getStatus, runRound } from '../api'

export default function WritingPage() {
  const [problems, setProblems] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [rounds, setRounds] = useState(3)
  const [preset, setPreset] = useState('gpt5')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [status, setStatus] = useState<any>(null)

  const modelPresets = {
    gpt5: { label: 'GPT-5 (default)', value: 'gpt5' },
    fast: { label: 'Fast (test)', value: 'fast' },
  }

  useEffect(() => {
    loadProblems()
  }, [])

  async function loadProblems() {
    try {
      const probs = await listProblems()
      setProblems(probs)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load problems' })
    }
  }

  async function handleWrite() {
    if (!selected) return
    setLoading(true)
    setMessage(null)
    try {
      // For now reuse runRound with preset; backend orchestrator will use mode distinction
      await runRound(selected, rounds, 1, 0.2, preset)
      setMessage({ type: 'info', text: 'Paper writing started (check Streamlit UI for paper mode)' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to start paper writing' })
    } finally {
      setLoading(false)
    }
  }

  async function onCheck() {
    if (!selected) return
    const s = await getStatus(selected)
    setStatus(s)
  }

  return (
    <div>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Mode</div>
          <div className="metric-value">Paper Writing</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Problems</div>
          <div className="metric-value">{problems.length}</div>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="two-column-layout">
        <div className="sidebar">
          <h3>Problems</h3>
          <ul className="problem-list">
            {problems.map(p => (
              <li 
                key={p}
                className={`problem-item ${selected === p ? 'selected' : ''}`}
                onClick={() => setSelected(p)}
              >
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="main-content">
          {selected ? (
            <>
              <h3>Paper Writing: {selected}</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <div className="problem-card">
                  <p>
                    Paper writing mode will analyze the research outputs in <code>output.md</code> 
                    and generate a formal academic paper in LaTeX format.
                  </p>
                  <p className="small-font" style={{ marginTop: '10px' }}>
                    The process involves multiple rounds of suggestion, fixing, and compilation 
                    to produce a polished final output.
                  </p>
                </div>

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
                    max={20}
                    value={rounds} 
                    onChange={e => setRounds(parseInt(e.target.value || '3'))}
                  />
                </div>

                <div className="control-buttons">
                  <button 
                    className="btn btn-primary" 
                    onClick={handleWrite}
                    disabled={loading}
                  >
                    📝 Generate Paper ({rounds} rounds)
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={onCheck}
                    disabled={!selected}
                  >
                    Check Status
                  </button>
                </div>
              </div>

              <div className="tabs">
                <button className="tab active">Instructions</button>
                <button className="tab">Status</button>
                <button className="tab">Artifacts</button>
              </div>

              <div className="pane">
                {status ? (
                  <pre>{JSON.stringify(status, null, 2)}</pre>
                ) : (
                  <>
                    <h4>How Paper Writing Works</h4>
                    <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
                      <li>The AI reviews your research outputs and notes</li>
                      <li>A paper suggester provides structure and content advice</li>
                      <li>A paper fixer implements the suggestions in LaTeX</li>
                      <li>The LaTeX is compiled to PDF automatically</li>
                      <li>Multiple rounds refine and improve the paper</li>
                    </ol>
                    
                    <h4 style={{ marginTop: '20px' }}>Output Files</h4>
                    <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                      <li><code>final_output.tex</code> - LaTeX source</li>
                      <li><code>final_output.pdf</code> - Compiled PDF</li>
                      <li>Located in the problem directory</li>
                    </ul>
                  </>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#6c757d', marginTop: '100px' }}>
              Select a problem from the list to generate a paper
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

