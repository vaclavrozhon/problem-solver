import React, { useEffect, useState } from 'react'
import { listDrafts, getDraftStatus, getDraftDrafts, runDraftWriting, getDraftRounds, getDraftFiles, getDraftFileContent, deleteDraftRounds, deleteDraft } from '../api'

interface Draft {
  id: string
  name: string
  createdAt: string
  size: number
}

interface RoundData {
  name: string
  verdict?: string
  provers: Array<{ name: string; content: string }>
  verifier?: { content: string; summary?: string }
  summarizer?: { content: string; summary?: string }
  paper_suggester?: { content: string; summary?: string }
  paper_fixer?: { content: string; summary?: string }
  timings?: Record<string, { duration_s: number }>
  completed_at?: number
  models?: Record<string, string>
}

interface FileData {
  name: string
  path: string
  type: string
  size: number
}

export default function WritingPage() {
  const [draftsProjects, setDraftsProjects] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [rounds, setRounds] = useState(3)
  const [preset, setPreset] = useState('gpt5')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [status, setStatus] = useState<any>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [hasOutputMd, setHasOutputMd] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [paperText, setPaperText] = useState('')
  const [draftName, setDraftName] = useState('draft.tex')
  const [activeTab, setActiveTab] = useState('status')
  const [roundsData, setRoundsData] = useState<RoundData[]>([])
  const [files, setFiles] = useState<FileData[]>([])
  const [fileContent, setFileContent] = useState<string>('')
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [deleteCount, setDeleteCount] = useState(1)
  const [showDeleteDraftModal, setShowDeleteDraftModal] = useState(false)
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null)

  const modelPresets = {
    gpt5: { label: 'GPT-5 (default)', value: 'gpt5' },
    fast: { label: 'Fast (test)', value: 'fast' },
  }

  useEffect(() => {
    loadDraftsProjects()
  }, [])

  useEffect(() => {
    if (selected) {
      loadDrafts()
      checkOutputMd()
      loadStatus()
      loadRounds()
      loadFiles()
    }
  }, [selected])

  // Auto-refresh status when on status tab
  useEffect(() => {
    if (selected && activeTab === 'status') {
      const interval = setInterval(loadStatus, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [selected, activeTab])

  async function loadDraftsProjects() {
    try {
      const projects = await listDrafts()
      setDraftsProjects(projects)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load draft projects' })
    }
  }

  async function loadStatus() {
    if (!selected) return
    try {
      const s = await getDraftStatus(selected)
      setStatus(s)
    } catch (err) {
      console.error('Failed to load status:', err)
      setStatus(null)
    }
  }

  async function loadDrafts() {
    if (!selected) return
    try {
      const draftsData = await getDraftDrafts(selected)
      setDrafts(draftsData)
    } catch (err) {
      console.error('Error loading drafts:', err)
      setDrafts([])
    }
  }

  async function checkOutputMd() {
    if (!selected) return
    try {
      const response = await fetch(`http://localhost:8000/drafts_public/${encodeURIComponent(selected)}/output-md`)
      setHasOutputMd(response.ok)
    } catch (err) {
      setHasOutputMd(false)
    }
  }

  async function loadRounds() {
    if (!selected) return
    try {
      const rounds = await getDraftRounds(selected)
      setRoundsData(rounds)
    } catch (err) {
      console.error('Error loading rounds:', err)
      setRoundsData([])
    }
  }

  async function loadFiles() {
    if (!selected) return
    try {
      const filesData = await getDraftFiles(selected)
      setFiles(filesData)
    } catch (err) {
      console.error('Error loading files:', err)
      setFiles([])
    }
  }

  async function loadFileContent(filePath: string) {
    if (!selected) return
    try {
      setLoading(true)
      const result = await getDraftFileContent(selected, filePath)
      setFileContent(result.content)
      setSelectedFilePath(filePath)
    } catch (err) {
      console.error('Failed to load file:', err)
      setFileContent('Error loading file content')
    } finally {
      setLoading(false)
    }
  }

  async function handleUploadDraft() {
    if (!selected || !selectedFile) return
    setLoading(true)
    setMessage(null)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const response = await fetch(`http://localhost:8000/drafts_public/${encodeURIComponent(selected)}/upload-draft`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) throw new Error('Upload failed')
      
      setMessage({ type: 'success', text: 'Draft uploaded successfully' })
      setSelectedFile(null)
      await loadDrafts()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload draft' })
    } finally {
      setLoading(false)
    }
  }

  async function handleConvertOutputMd() {
    if (!selected) return
    setLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch(`http://localhost:8000/drafts_public/${encodeURIComponent(selected)}/convert-output`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Conversion failed')
      
      setMessage({ type: 'success', text: 'output.md converted to first draft' })
      await loadDrafts()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to convert output.md' })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateDraftFromText() {
    if (!selected || !paperText.trim()) {
      setMessage({ type: 'error', text: 'Please enter some text for the draft' })
      return
    }
    
    setLoading(true)
    setMessage(null)
    
    try {
      // Create a blob and FormData to simulate file upload
      const blob = new Blob([paperText], { type: 'text/plain' })
      const file = new File([blob], draftName, { type: 'text/plain' })
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`http://localhost:8000/drafts_public/${encodeURIComponent(selected)}/upload-draft`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) throw new Error('Failed to create draft')
      
      setMessage({ type: 'success', text: `Draft "${draftName}" created successfully from pasted text` })
      setPaperText('')
      await loadDrafts()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create draft from text' })
    } finally {
      setLoading(false)
    }
  }

  async function handleStartWriting() {
    if (!selected || drafts.length === 0) return
    setLoading(true)
    setMessage(null)
    
    try {
      const result = await runDraftWriting(selected, rounds, preset)
      setMessage({ type: 'success', text: 'Paper writing process started' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to start paper writing' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteRounds() {
    console.log('handleDeleteRounds called', { selected, deleteCount })
    if (!selected || deleteCount <= 0) return
    if (!confirm(`Are you sure you want to delete ${deleteCount} rounds?`)) return
    
    setLoading(true)
    setMessage(null)
    
    try {
      console.log('Making deleteDraftRounds API call', { selected, deleteCount })
      const result = await deleteDraftRounds(selected, deleteCount)
      console.log('API call result:', result)
      setMessage({ type: 'success', text: result.message || `Deleted ${result.deleted} rounds` })
      // Refresh rounds data after deletion
      loadRounds()
      loadStatus()
    } catch (err: any) {
      console.error('Delete rounds error:', err)
      setMessage({ type: 'error', text: err.message || 'Failed to delete rounds' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteDraft() {
    if (!draftToDelete) return
    setLoading(true)
    try {
      const result = await deleteDraft(draftToDelete)
      setMessage({ 
        type: 'success', 
        text: `Draft '${draftToDelete}' deleted successfully` 
      })
      setShowDeleteDraftModal(false)
      setDraftToDelete(null)
      // Clear selection if deleted draft was selected
      if (selected === draftToDelete) {
        setSelected(null)
      }
      // Refresh drafts list
      loadDraftsProjects()
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to delete draft' 
      })
      setShowDeleteDraftModal(false)
    } finally {
      setLoading(false)
    }
  }

  function confirmDeleteDraft(draftName: string) {
    setDraftToDelete(draftName)
    setShowDeleteDraftModal(true)
  }

  return (
    <div>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Mode</div>
          <div className="metric-value">Paper Writing</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Drafts</div>
          <div className="metric-value">{draftsProjects.length}</div>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="two-column-layout">
        <div className="sidebar">
          <h3>Draft Projects</h3>
          <ul className="problem-list">
            {draftsProjects.map(d => (
              <li 
                key={d}
                className={`problem-item ${selected === d ? 'selected' : ''}`}
              >
                <div onClick={() => setSelected(d)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{d}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    confirmDeleteDraft(d)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc3545',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '12px',
                    marginLeft: '8px'
                  }}
                  title="Delete draft"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="main-content">
          {selected ? (
            <>
              <h3>Paper Writing: {selected}</h3>
              
              {/* Draft Management Section */}
              <div style={{ marginBottom: '20px' }}>
                <div className="problem-card">
                  <h4>📄 Draft Management</h4>
                  
                  {drafts.length === 0 ? (
                    <div>
                      <p>No drafts found. Create your first draft to begin paper writing.</p>
                      
                      {/* File Upload */}
                      <div style={{ marginTop: '16px' }}>
                        <h5>Upload First Draft</h5>
                        <input
                          type="file"
                          accept=".tex,.txt,.md"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          style={{ marginBottom: '8px' }}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={handleUploadDraft}
                          disabled={!selectedFile || loading}
                        >
                          📤 Upload Draft
                        </button>
                      </div>

                      {/* Copy-Paste Draft */}
                      <div style={{ marginTop: '16px' }}>
                        <h5>Create Draft from Text</h5>
                        <p className="small-font">Copy and paste your paper content below</p>
                        
                        <div className="input-group" style={{ marginBottom: '12px' }}>
                          <label>Draft filename:</label>
                          <input 
                            type="text" 
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            placeholder="e.g., draft.tex, paper.txt"
                            style={{ width: '250px' }}
                          />
                        </div>
                        
                        <textarea 
                          value={paperText}
                          onChange={(e) => setPaperText(e.target.value)}
                          placeholder="Paste your paper content here..."
                          rows={8}
                          style={{ 
                            width: '100%', 
                            minHeight: '200px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            marginBottom: '12px'
                          }}
                        />
                        
                        <div className="control-buttons">
                          <button
                            className="btn btn-primary"
                            onClick={handleCreateDraftFromText}
                            disabled={!paperText.trim() || loading}
                          >
                            📝 Create Draft from Text
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setPaperText('')}
                            disabled={loading}
                          >
                            🗑️ Clear Text
                          </button>
                        </div>
                      </div>

                      {/* Convert output.md */}
                      {hasOutputMd && (
                        <div style={{ marginTop: '16px' }}>
                          <h5>Convert Research Output</h5>
                          <p className="small-font">Use your research output as the first draft</p>
                          <button
                            className="btn btn-secondary"
                            onClick={handleConvertOutputMd}
                            disabled={loading}
                          >
                            🔄 Convert output.md to Draft
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p>Found {drafts.length} draft(s). Latest drafts will be used for paper writing.</p>
                      
                      {/* Draft List */}
                      <div style={{ marginTop: '16px' }}>
                        <h5>Current Drafts</h5>
                        <ul style={{ marginLeft: '20px' }}>
                          {drafts.map((draft) => (
                            <li key={draft.id}>
                              <strong>{draft.name}</strong> - {draft.size} bytes - {new Date(draft.createdAt).toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Writing Controls */}
                      <div style={{ marginTop: '16px' }}>
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
                            onClick={handleStartWriting}
                            disabled={loading}
                          >
                            ✏️ Start Writing Process ({rounds} rounds)
                          </button>
                        </div>

                        {/* Delete Rounds Section */}
                        {Array.isArray(roundsData) && roundsData.length > 0 && (
                          <div style={{ marginTop: '16px', padding: '12px', background: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeaa7' }}>
                            <h5 style={{ marginTop: 0, color: '#856404' }}>🗑️ Delete Rounds</h5>
                            <div className="input-group">
                              <label>Delete how many rounds:</label>
                              <input 
                                type="number" 
                                min={1} 
                                max={roundsData.length}
                                value={deleteCount} 
                                onChange={e => setDeleteCount(parseInt(e.target.value || '1'))}
                                style={{ width: '80px' }}
                              />
                              <span style={{ fontSize: '12px', color: '#666' }}>
                                (max {roundsData.length})
                              </span>
                            </div>
                            <button
                              className="btn btn-danger"
                              onClick={handleDeleteRounds}
                              disabled={loading}
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              Delete {deleteCount} Round{deleteCount !== 1 ? 's' : ''}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'status' ? 'active' : ''}`}
                  onClick={() => setActiveTab('status')}
                >
                  Status
                </button>
                <button 
                  className={`tab ${activeTab === 'conversations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('conversations')}
                >
                  Conversations
                </button>
                <button 
                  className={`tab ${activeTab === 'files' ? 'active' : ''}`}
                  onClick={() => setActiveTab('files')}
                >
                  Files
                </button>
              </div>

              <div className="pane">
                {activeTab === 'status' && (
                  <WritingStatusPane status={status} rounds={roundsData} />
                )}
                
                {activeTab === 'conversations' && (
                  <WritingConversationsPane rounds={roundsData} loading={loading} />
                )}
                
                {activeTab === 'files' && (
                  <WritingFilesPane 
                    draftName={selected}
                    files={files}
                    fileContent={fileContent}
                    selectedFilePath={selectedFilePath}
                    loading={loading}
                    onLoadFile={loadFileContent}
                  />
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#6c757d', marginTop: '100px' }}>
              Select a problem from the list to manage drafts and generate papers
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WritingStatusPane({ status, rounds }: { status: any, rounds: RoundData[] }) {
  if (!status) {
    return (
      <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
        Loading paper writing status...
      </div>
    )
  }

  const overall = status.overall || status || {}

  return (
    <div>
      <div style={{ marginBottom: '16px', color: '#666', fontSize: '12px' }}>
        Status refreshes automatically every 5 seconds
      </div>

      {/* Overall Status Header */}
      <div style={{ marginBottom: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
        <h4>Overall Status</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '8px' }}>
          <div>
            <strong>Phase:</strong> {overall.phase || 'idle'}
            {overall.is_running && <span style={{ color: '#28a745', marginLeft: '8px' }}>🟢 Running</span>}
          </div>
          <div>
            <strong>Current Round:</strong> {overall.current_round || status.round || 0}
          </div>
          <div>
            <strong>Remaining:</strong> {overall.remaining_rounds || 0} rounds
          </div>
          <div>
            <strong>Last Activity:</strong> {overall.last_round_completed ? '✅ Complete' : '⏳ In Progress'}
          </div>
        </div>
      </div>

      {/* Round History */}
      <div>
        <h4>Round History ({Array.isArray(rounds) ? rounds.length : 0} rounds)</h4>
        {!Array.isArray(rounds) || rounds.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>No rounds completed yet</div>
        ) : (
          <div>
            {rounds.slice().reverse().map((round, idx) => (
              <div key={round.name} style={{
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '8px',
                background: '#f8f9fa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{round.name}</strong>
                    <span style={{ 
                      marginLeft: '12px', 
                      fontSize: '12px',
                      color: '#28a745'
                    }}>
                      ✅ Complete
                    </span>
                  </div>
                </div>
                
                {/* Models used */}
                {Object.keys(round.models || {}).length > 0 && (
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    Models: {Object.entries(round.models || {}).map(([agent, model]) => 
                      `${agent}: ${model}`
                    ).join(', ')}
                  </div>
                )}
                
                {/* Timing info */}
                {Object.keys(round.timings || {}).length > 0 && (
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                    Duration: {Object.entries(round.timings || {}).map(([agent, timing]: [string, any]) => 
                      `${agent}: ${timing.duration_s || 0}s`
                    ).join(', ')}
                  </div>
                )}

                {/* Agents used */}
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                  {round.paper_suggester && <span>📝 Paper Suggester </span>}
                  {round.paper_fixer && <span>🔧 Paper Fixer </span>}
                  {round.provers && round.provers.length > 0 && <span>🧠 {round.provers.length} Prover(s) </span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <h4 style={{ marginTop: '20px' }}>Full Status (JSON)</h4>
      <pre style={{ background: '#f8f9fa', padding: '12px', borderRadius: '6px', fontSize: '12px', overflow: 'auto' }}>
        {JSON.stringify(status, null, 2)}
      </pre>
    </div>
  )
}

function WritingConversationsPane({ rounds, loading }: { rounds: RoundData[], loading: boolean }) {
  if (loading) {
    return <div>Loading conversations...</div>
  }

  if (!Array.isArray(rounds) || rounds.length === 0) {
    return <div>No rounds yet for this paper writing task.</div>
  }

  return (
    <div>
      <h4>📝 Paper Suggester ↔ Paper Fixer — All Rounds</h4>
      {rounds.slice().reverse().map((round, idx) => (
        <WritingRoundDisplay key={round.name} round={round} />
      ))}
    </div>
  )
}

function WritingRoundDisplay({ round }: { round: RoundData }) {
  return (
    <div style={{ marginBottom: '30px', border: '1px solid #dee2e6', borderRadius: '8px', padding: '16px' }}>
      {/* Round header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <strong>{round.name}</strong>
        </div>
        <div>
          {round.timings && Object.keys(round.timings).length > 0 && (
            <span>
              <strong>Time (s):</strong> {
                Object.entries(round.timings).map(([k, v]) => 
                  `${k}:${v.duration_s}`
                ).join(', ')
              }
            </span>
          )}
        </div>
      </div>

      {/* Two-column conversation for paper writing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {round.paper_suggester && (
          <div>
            <strong>📝 Paper Suggester Output</strong>
            <div className="pane" style={{ height: '400px', fontSize: '12px' }}>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                {round.paper_suggester.content}
              </div>
            </div>
          </div>
        )}
        
        {round.paper_fixer && (
          <div>
            <strong>✏️ Paper Writer Output</strong>
            <div className="pane" style={{ height: '400px', fontSize: '12px' }}>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                {round.paper_fixer.content}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Show message if neither suggester nor fixer content is available */}
      {!round.paper_suggester && !round.paper_fixer && (
        <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: '20px' }}>
          No paper suggester or writer output available for this round
        </div>
      )}
    </div>
  )
}

function WritingFilesPane({ 
  draftName, 
  files, 
  fileContent, 
  selectedFilePath, 
  loading,
  onLoadFile 
}: { 
  draftName: string | null,
  files: FileData[], 
  fileContent: string, 
  selectedFilePath: string | null,
  loading: boolean,
  onLoadFile: (filePath: string) => void 
}) {
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

  return (
    <div style={{ display: 'flex', height: '600px' }}>
      {/* File list panel */}
      <div style={{ width: '300px', borderRight: '1px solid #ddd', paddingRight: '16px' }}>
        <h4>Draft Files</h4>
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
                      onClick={() => onLoadFile(file.path)}
                      style={{
                        background: selectedFilePath === file.path ? '#e3f2fd' : 'transparent',
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
        {selectedFilePath ? (
          <div>
            <h4>{selectedFilePath}</h4>
            {loading ? (
              <p>Loading file content...</p>
            ) : (
              <div>
                {fileContent.includes('PDF file:') && fileContent.includes('pdf_url') ? (
                  <div>
                    <p>This is a PDF file.</p>
                    <a 
                      href={`http://localhost:8000/drafts_public/${encodeURIComponent(draftName || '')}/file-raw?file_path=${encodeURIComponent(selectedFilePath)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#007bff', textDecoration: 'underline' }}
                    >
                      🔗 Click here to open PDF in new tab
                    </a>
                  </div>
                ) : selectedFilePath.endsWith('.md') ? (
                  <div 
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(fileContent) }}
                  />
                ) : (
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    wordWrap: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    background: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '6px'
                  }}>
                    {fileContent}
                  </pre>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '100px' }}>
            <p>Select a file from the list to view its contents</p>
          </div>
        )}
      </div>

      {/* Delete Draft Modal */}
      {showDeleteDraftModal && (
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
            <h3 style={{ color: '#dc3545' }}>⚠️ Delete Draft</h3>
            <p>
              Are you sure you want to delete the draft <strong>"{draftToDelete}"</strong>?
            </p>
            <p style={{ fontSize: '14px', color: '#666', background: '#fff3cd', padding: '8px', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
              This will permanently delete all associated files, rounds, papers, and data. This action cannot be undone.
            </p>
            
            <div className="control-buttons" style={{ marginTop: '20px' }}>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteDraft}
                disabled={loading}
              >
                🗑️ Delete Draft
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowDeleteDraftModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

