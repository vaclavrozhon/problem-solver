import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { listProblems, runRound, getStatus, stopProblem, getRounds, deleteRounds, listFiles, getFileContent, getFileVersions, deleteProblem } from '../api'

// Conversation component interfaces
interface RoundData {
  name: string
  verdict?: string
  timings?: Record<string, { duration_s: number }>
  provers: Array<{ name: string, content: string }>
  verifier: string
  summary: string
}

// ConversationTabs component
function ConversationTabs({ problemName }: { problemName: string }) {
  const [activeTab, setActiveTab] = useState('status')
  const [rounds, setRounds] = useState<RoundData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRounds()
  }, [problemName])

  async function loadRounds() {
    if (!problemName) return
    setLoading(true)
    
    try {
      const roundsData = await getRounds(problemName)
      setRounds(roundsData)
    } catch (error) {
      console.error('Error loading rounds:', error)
      setRounds([])
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'status', label: 'Status' },
    { id: 'conversations', label: 'Conversations' },
    { id: 'files', label: 'Files' }
  ]

  return (
    <div>
      {/* Tab navigation */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pane">
        {activeTab === 'status' && (
          <StatusPane problemName={problemName} />
        )}
        
        {activeTab === 'conversations' && (
          <ConversationsPane rounds={rounds} loading={loading} />
        )}
        
        {activeTab === 'files' && (
          <FilesPane problemName={problemName} />
        )}
      </div>
    </div>
  )
}

function StatusPane({ problemName }: { problemName: string }) {
  const [status, setStatus] = useState<any>(null)

  useEffect(() => {
    if (problemName) {
      getStatus(problemName).then(setStatus).catch(() => setStatus(null))
    }
  }, [problemName])

  if (!status) {
    return <div>Loading status...</div>
  }

  const overall = status.overall || {}
  const rounds = status.rounds || []

  return (
    <div>
      {/* Overall Status Header */}
      <div style={{ marginBottom: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
        <h4>Overall Status</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '8px' }}>
          <div>
            <strong>Phase:</strong> {overall.phase || 'idle'}
            {overall.is_running && <span style={{ color: '#28a745', marginLeft: '8px' }}>🟢 Running</span>}
          </div>
          <div>
            <strong>Current Round:</strong> {overall.current_round || 0}
          </div>
          <div>
            <strong>Remaining:</strong> {overall.remaining_rounds || 0} rounds
          </div>
          <div>
            <strong>Last Round:</strong> {overall.last_round_completed || overall.phase === 'idle' ? '✅ Complete' : `⏳ In Progress (${overall.phase || 'running'})`}
          </div>
        </div>
        
        {/* Display error message if present */}
        {overall.error && (
          <div style={{ 
            marginTop: '12px', 
            padding: '12px', 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            border: '1px solid #f5c6cb', 
            borderRadius: '6px' 
          }}>
            <strong>❌ Error:</strong>
            <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-word' }}>
              {overall.error}
            </div>
          </div>
        )}
      </div>

      {/* Round List */}
      <div>
        <h4>Round History ({rounds.length} rounds)</h4>
        {rounds.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>No rounds completed yet</div>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {rounds.map((round: any, idx: number) => (
              <div key={round.name} style={{
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '8px',
                background: round.status === 'completed' ? '#f8f9fa' : '#fff3cd'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{round.name}</strong>
                    <span style={{ 
                      marginLeft: '12px', 
                      fontSize: '12px',
                      color: round.status === 'completed' ? '#28a745' : '#856404'
                    }}>
                      {round.status === 'completed' || overall.phase === 'idle' ? '✅ Complete' : 
                        (round.number === overall.current_round ? `⏳ In Progress (${overall.phase || 'running'})` : '⏳ In Progress')}
                    </span>
                  </div>
                  {round.verdict && (
                    <span className={`verdict-${round.verdict}`} style={{ fontSize: '12px' }}>
                      {round.verdict}
                    </span>
                  )}
                </div>
                
                {/* Models used */}
                {Object.keys(round.models).length > 0 && (
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    Models: {Object.entries(round.models).map(([agent, model]) => 
                      `${agent}: ${model}`
                    ).join(', ')}
                  </div>
                )}
                
                {/* Timing info */}
                {Object.keys(round.timings).length > 0 && (
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                    Duration: {Object.entries(round.timings).map(([agent, timing]: [string, any]) => 
                      `${agent}: ${Math.ceil(timing.duration_s || 0)}s`
                    ).join(', ')}
                  </div>
                )}
                
                {round.completed_at && (
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                    Completed: {new Date(round.completed_at * 1000).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ConversationsPane({ rounds, loading }: { rounds: RoundData[], loading: boolean }) {
  if (loading) {
    return <div>Loading conversations...</div>
  }

  if (rounds.length === 0) {
    return <div>No rounds yet for this problem.</div>
  }

  return (
    <div>
      <h4>🧪 Prover ↔ Verifier ↔ Summarizer — All Rounds</h4>
      {rounds.slice().reverse().map((round, idx) => (
        <RoundDisplay key={round.name} round={round} />
      ))}
    </div>
  )
}

function RoundDisplay({ round }: { round: RoundData }) {
  const [selectedProverIndex, setSelectedProverIndex] = useState(0)
  
  const verdictEmoji = {
    "promising": "✅",
    "partial success": "🔶", 
    "uncertain": "⚠️",
    "unlikely": "❌",
    "success": "🎉",
    "nothing so far": "⭕"
  }[round.verdict || ''] || "—"

  return (
    <div style={{ marginBottom: '30px', border: '1px solid #dee2e6', borderRadius: '8px', padding: '16px' }}>
      {/* Round header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <strong>{round.name}</strong>
        </div>
        <div>
          {round.verdict && (
            <span><strong>Verdict:</strong> {verdictEmoji} {round.verdict}</span>
          )}
        </div>
        <div>
          {round.timings && Object.keys(round.timings).length > 0 && (
            <span>
              <strong>Time (s):</strong> {
                Object.entries(round.timings).map(([k, v]) => 
                  `${k[0].toUpperCase()}:${Math.ceil(v.duration_s)}`
                ).join(', ')
              }
            </span>
          )}
        </div>
      </div>

      {/* Three-column conversation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <strong>Prover</strong>
            {round.provers.length > 1 && (
              <select 
                value={selectedProverIndex} 
                onChange={(e) => setSelectedProverIndex(Number(e.target.value))}
                style={{ 
                  fontSize: '11px', 
                  padding: '2px 6px',
                  border: '1px solid #ccc',
                  borderRadius: '3px'
                }}
              >
                {round.provers.map((prover, idx) => (
                  <option key={idx} value={idx}>
                    {prover.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="pane" style={{ height: '300px' }}>
            {round.provers.length > 0 && (
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                {round.provers[selectedProverIndex]?.content || 'No content available'}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <strong>Verifier</strong>
          <div className="pane" style={{ height: '300px' }}>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {round.verifier}
            </div>
          </div>
        </div>
        
        <div>
          <strong>Summary</strong>
          <div className="pane" style={{ height: '300px' }}>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {round.summary}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilesPane({ problemName }: { problemName: string }) {
  const [files, setFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [paperText, setPaperText] = useState('')
  const [fileName, setFileName] = useState('paper.txt')
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [fileVersions, setFileVersions] = useState<any[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string>('current')
  
  useEffect(() => {
    loadFiles()
  }, [problemName])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const fileList = await listFiles(problemName)
      setFiles(fileList)
    } catch (err) {
      console.error('Failed to load files:', err)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const loadFileContent = async (filePath: string, version: string = 'current') => {
    try {
      setLoading(true)
      
      // Reset versions when switching files
      if (selectedFile !== filePath) {
        setFileVersions([])
        setSelectedVersion('current')
      }
      
      // Load versions for versioned files
      if ((filePath === 'notes.md' || filePath === 'output.md') && selectedFile !== filePath) {
        try {
          const versionsResult = await getFileVersions(problemName, filePath)
          setFileVersions(versionsResult.versions || [])
        } catch (err) {
          console.error('Failed to load versions:', err)
          setFileVersions([])
        }
      }
      
      const result = await getFileContent(problemName, filePath, version === 'current' ? undefined : version)
      setFileContent(result.content)
      setSelectedFile(filePath)
      setSelectedVersion(version)
    } catch (err) {
      console.error('Failed to load file:', err)
      setFileContent('Error loading file content')
    } finally {
      setLoading(false)
    }
  }

  const loadFileVersion = async (version: string) => {
    if (selectedFile) {
      await loadFileContent(selectedFile, version)
    }
  }

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    return content
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>')
  }

  const handleSavePaper = async () => {
    if (!paperText.trim()) {
      setSaveMessage({ type: 'error', text: 'Please enter some text to save' })
      return
    }

    try {
      const blob = new Blob([paperText], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setSaveMessage({ type: 'success', text: `File ${fileName} downloaded successfully` })
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to save file' })
    }
  }

  return (
    <div style={{ display: 'flex', height: '600px' }}>
      {/* File list panel */}
      <div style={{ width: '300px', borderRight: '1px solid #ddd', paddingRight: '16px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h4>Upload or Paste Paper Content</h4>
          <div className="input-group" style={{ marginBottom: '12px' }}>
            <input 
              type="text" 
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g., paper.txt, notes.md"
              style={{ width: '100%', fontSize: '12px' }}
            />
          </div>
          
          <textarea 
            value={paperText}
            onChange={(e) => setPaperText(e.target.value)}
            placeholder="Paste paper content..."
            rows={5}
            style={{ 
              width: '100%', 
              fontFamily: 'monospace',
              fontSize: '11px',
              marginBottom: '8px'
            }}
          />
          
          <div className="control-buttons">
            <button 
              className="btn btn-primary" 
              onClick={handleSavePaper}
              disabled={!paperText.trim()}
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              💾 Download
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setPaperText('')}
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              🗑️ Clear
            </button>
          </div>
          
          {saveMessage && (
            <div className={`message message-${saveMessage.type}`} style={{ fontSize: '11px', marginTop: '8px' }}>
              {saveMessage.text}
            </div>
          )}
        </div>

        <hr />

        <h4>Problem Files</h4>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {files.length === 0 ? (
              <p style={{ color: '#666', fontSize: '14px' }}>No files found</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {files.map((file, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>
                    <button
                      onClick={() => loadFileContent(file.path)}
                      style={{
                        background: selectedFile === file.path ? '#e3f2fd' : 'transparent',
                        border: '1px solid #ddd',
                        padding: '8px 12px',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{file.name}</div>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        {file.type} • {Math.round(file.size / 1024)}KB
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* File content panel */}
      <div style={{ flex: 1, paddingLeft: '16px', overflow: 'auto' }}>
        {selectedFile ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <h4 style={{ margin: 0 }}>{selectedFile}</h4>
              {(selectedFile === 'notes.md' || selectedFile === 'output.md') && fileVersions.length > 0 && (
                <select 
                  value={selectedVersion} 
                  onChange={(e) => loadFileVersion(e.target.value)}
                  style={{ 
                    fontSize: '12px', 
                    padding: '4px 8px',
                    border: '1px solid #ccc',
                    borderRadius: '3px'
                  }}
                >
                  {fileVersions.map(version => (
                    <option key={version.version} value={version.version}>
                      {version.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {loading ? (
              <p>Loading file content...</p>
            ) : (
              <div>
                {selectedFile.endsWith('.md') ? (
                  <div 
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(fileContent) }}
                    style={{
                      background: '#f8f9fa',
                      padding: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}
                  />
                ) : (
                  <pre style={{
                    background: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {fileContent}
                  </pre>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: '#666', textAlign: 'center', marginTop: '50px' }}>
            Select a file to view its content
          </div>
        )}
      </div>
    </div>
  )
}

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
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [problems, setProblems] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [rounds, setRounds] = useState(5)
  const [provers, setProvers] = useState(2)
  const [temperature, setTemperature] = useState(0.4)
  const [preset, setPreset] = useState('gpt5')
  const [statusMap, setStatusMap] = useState<Record<string, ProblemStatus>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [autoRefresh] = useState(true) // Always ON
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteRoundsCount, setDeleteRoundsCount] = useState(1)
  const [showDeleteProblemModal, setShowDeleteProblemModal] = useState(false)
  const [problemToDelete, setProblemToDelete] = useState<string | null>(null)

  // Model presets matching web_app.py
  const modelPresets = {
    gpt5: { label: 'GPT-5 (default)', value: 'gpt5' },
    fast: { label: 'GPT4 (test)', value: 'fast' },
  }

  // Load problems on mount
  useEffect(() => {
    loadProblems()
  }, [])
  
  // Auto-select problem from URL parameter
  useEffect(() => {
    const problemFromUrl = searchParams.get('problem')
    if (problemFromUrl && problems.includes(problemFromUrl) && selected !== problemFromUrl) {
      setSelected(problemFromUrl)  // Only set state, don't navigate (we're already on this URL)
    }
  }, [problems, searchParams, selected])

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

  // Function to select a problem and update URL
  function selectProblem(problemName: string | null) {
    setSelected(problemName)
    if (problemName) {
      navigate(`/solve?problem=${encodeURIComponent(problemName)}`)
    } else {
      navigate('/solve')
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

  async function handleDeleteRounds() {
    if (!selected) return
    setLoading(true)
    try {
      const result = await deleteRounds(selected, deleteRoundsCount)
      setMessage({ 
        type: 'success', 
        text: `${result.message}` 
      })
      setShowDeleteModal(false)
      // Refresh rounds display
      setTimeout(() => {
        window.location.reload() // Simple way to refresh the conversations
      }, 1000)
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to delete rounds. Make sure the server is updated with the latest changes.' 
      })
      setShowDeleteModal(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteProblem() {
    if (!problemToDelete) return
    setLoading(true)
    try {
      const result = await deleteProblem(problemToDelete)
      setMessage({ 
        type: 'success', 
        text: `Problem '${problemToDelete}' deleted successfully` 
      })
      setShowDeleteProblemModal(false)
      setProblemToDelete(null)
      // Clear selection if deleted problem was selected
      if (selected === problemToDelete) {
        selectProblem(null)
      }
      // Refresh problem list
      loadProblems()
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to delete problem' 
      })
      setShowDeleteProblemModal(false)
    } finally {
      setLoading(false)
    }
  }

  function confirmDeleteProblem(problemName: string) {
    setProblemToDelete(problemName)
    setShowDeleteProblemModal(true)
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
                >
                  <div onClick={() => selectProblem(p)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`status-dot ${info.status}`}></span>
                      <span>{p}</span>
                    </div>
                    {info.status === 'running' && (
                      <span className="small-font">Round {info.currentRound}</span>
                    )}
                  </div>
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
                  {statusMap[selected].models && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Models: Prover: {statusMap[selected].models.prover}, 
                      Verifier: {statusMap[selected].models.verifier}, 
                      Summarizer: {statusMap[selected].models.summarizer}
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
                  
                  <label>Temperature {preset === 'gpt5' && '(N/A for GPT-5)'}</label>
                  <input 
                    type="number" 
                    step={0.05} 
                    min={0} 
                    max={1} 
                    value={preset === 'gpt5' ? 1.0 : temperature} 
                    onChange={e => setTemperature(parseFloat(e.target.value || '0.4'))}
                    disabled={preset === 'gpt5'}
                    title={preset === 'gpt5' ? 'GPT-5 models only support default temperature' : ''}
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
                  
                  <button 
                    className="btn btn-danger" 
                    onClick={() => setShowDeleteModal(true)}
                    disabled={!selected || loading}
                    style={{ marginLeft: '8px' }}
                  >
                    🗑️ Delete Old Rounds
                  </button>
                  
                  <button 
                    className="btn btn-danger" 
                    onClick={() => confirmDeleteProblem(selected)}
                    disabled={!selected || loading}
                    style={{ marginLeft: '8px' }}
                  >
                    Delete this problem
                  </button>
                </div>
              </div>

              {/* Delete Rounds Modal */}
              {showDeleteModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    minWidth: '400px',
                    maxWidth: '500px'
                  }}>
                    <h3>Delete Past Conversations</h3>
                    <p>How many oldest rounds do you want to delete?</p>
                    
                    <div className="input-group" style={{ margin: '16px 0' }}>
                      <label>Delete Count</label>
                      <input 
                        type="number" 
                        min={1}
                        max={20}
                        value={deleteRoundsCount} 
                        onChange={e => setDeleteRoundsCount(parseInt(e.target.value || '1'))}
                      />
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        oldest rounds to delete
                      </span>
                    </div>
                    
                    <div className="control-buttons">
                      <button 
                        className="btn btn-danger" 
                        onClick={handleDeleteRounds}
                        disabled={loading}
                      >
                        🗑️ Delete Rounds
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => setShowDeleteModal(false)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Problem Modal */}
              {showDeleteProblemModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    minWidth: '400px',
                    maxWidth: '500px'
                  }}>
                    <h3 style={{ color: '#dc3545' }}>⚠️ Delete Problem</h3>
                    <p>
                      Are you sure you want to delete the problem <strong>"{problemToDelete}"</strong>?
                    </p>
                    <p style={{ fontSize: '14px', color: '#666', background: '#fff3cd', padding: '8px', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
                      This will permanently delete all associated files, rounds, papers, and data. This action cannot be undone.
                    </p>
                    
                    <div className="control-buttons" style={{ marginTop: '20px' }}>
                      <button 
                        className="btn btn-danger" 
                        onClick={handleDeleteProblem}
                        disabled={loading}
                      >
                        🗑️ Delete Problem
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => setShowDeleteProblemModal(false)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabbed interface */}
              <ConversationTabs problemName={selected} />
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