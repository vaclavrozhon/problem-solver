import React, { useState } from 'react'
import { createProblem, createDraft, uploadProblemPaper, uploadDraftPaper, addProblemPaperFromUrl, addDraftPaperFromUrl, uploadProblemTextContent, uploadDraftTextContent } from '../api'
import { useNavigate } from 'react-router-dom'

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

export default function TaskCreationPage() {
  const navigate = useNavigate()
  
  // Form state
  const [taskType, setTaskType] = useState<'solving' | 'writing'>('solving')
  const [taskName, setTaskName] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskFormat, setTaskFormat] = useState<'txt' | 'tex' | 'md'>('txt')
  const [initialDraft, setInitialDraft] = useState('') // For paper writing tasks
  
  // Paper management state
  interface PaperEntry {
    type: 'file' | 'text'
    data: File | string
    description: string
    filename?: string // for text entries
    id: string // unique identifier for download links
  }
  
  const [paperEntries, setPaperEntries] = useState<PaperEntry[]>([])
  const [showAddPaperModal, setShowAddPaperModal] = useState(false)
  
  // Temporary state for adding papers
  const [newPaperType, setNewPaperType] = useState<'file' | 'text'>('file')
  const [newPaperFile, setNewPaperFile] = useState<File | null>(null)
  const [newPaperText, setNewPaperText] = useState('')
  const [newPaperDescription, setNewPaperDescription] = useState('')
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [createdTaskName, setCreatedTaskName] = useState<string | null>(null)

  function handleAddSinglePaper() {
    let entry: PaperEntry | null = null
    
    if (newPaperType === 'file' && newPaperFile) {
      entry = {
        type: 'file',
        data: newPaperFile,
        description: newPaperDescription,
        id: Date.now().toString()
      }
    } else if (newPaperType === 'text' && newPaperText.trim()) {
      // Generate filename based on content preview
      const filename = `text_${Date.now()}.txt`
      entry = {
        type: 'text',
        data: newPaperText,
        description: newPaperDescription,
        filename: filename,
        id: Date.now().toString()
      }
    }
    
    if (entry) {
      setPaperEntries([...paperEntries, entry])
      resetNewPaperForm()
      setMessage({ type: 'success', text: 'Paper added successfully!' })
    } else {
      setMessage({ type: 'error', text: 'Please select a file or enter text content.' })
    }
  }
  
  function resetNewPaperForm() {
    setNewPaperFile(null)
    setNewPaperText('')
    setNewPaperDescription('')
    setNewPaperType('file')
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  function downloadPaper(entry: PaperEntry) {
    if (entry.type === 'file') {
      // Create download link for file
      const url = URL.createObjectURL(entry.data as File)
      const a = document.createElement('a')
      a.href = url
      a.download = (entry.data as File).name
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // Create download link for text content
      const blob = new Blob([entry.data as string], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = entry.filename || 'paper.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  function removePaperEntry(index: number) {
    setPaperEntries(paperEntries.filter((_, i) => i !== index))
  }
  
  function updatePaperDescription(index: number, description: string) {
    const newEntries = [...paperEntries]
    newEntries[index].description = description
    setPaperEntries(newEntries)
  }

  async function createTask() {
    if (!taskName.trim() || !taskDescription.trim()) {
      setMessage({ type: 'error', text: 'Please fill in task name and description' })
      return
    }

    // For writing tasks, require an initial draft
    if (taskType === 'writing' && !initialDraft.trim()) {
      setMessage({ type: 'error', text: 'Please provide an initial draft for the paper writing task' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Create the task
      let result
      if (taskType === 'solving') {
        result = await createProblem(taskName, taskDescription, taskFormat)
      } else {
        result = await createDraft(taskName, taskDescription, initialDraft)
      }
      
      const actualTaskName = result.name // Server may sanitize the name
      setCreatedTaskName(actualTaskName)
      
      // Upload papers
      await uploadPapers(actualTaskName)
      
      setMessage({ type: 'success', text: `${taskType === 'solving' ? 'Problem' : 'Draft'} created successfully!` })
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create task' })
    } finally {
      setLoading(false)
    }
  }

  async function uploadPapers(taskName: string) {
    const errors: string[] = []

    for (const entry of paperEntries) {
      try {
        if (entry.type === 'file') {
          const file = entry.data as File
          if (taskType === 'solving') {
            await uploadProblemPaper(taskName, file)
          } else {
            await uploadDraftPaper(taskName, file)
          }
        } else if (entry.type === 'url') {
          const url = entry.data as string
          if (taskType === 'solving') {
            await addProblemPaperFromUrl(taskName, url)
          } else {
            await addDraftPaperFromUrl(taskName, url)
          }
        } else if (entry.type === 'text') {
          const content = entry.data as string
          const filename = entry.filename || 'text-paper.txt'
          if (taskType === 'solving') {
            await uploadProblemTextContent(taskName, content, filename, entry.description)
          } else {
            await uploadDraftTextContent(taskName, content, filename, entry.description)
          }
        }
      } catch (err: any) {
        const identifier = entry.type === 'file' ? (entry.data as File).name : 
                          entry.type === 'url' ? (entry.data as string) : 
                          entry.filename || 'text content'
        errors.push(`Failed to upload ${identifier}: ${err.message}`)
      }
    }

    if (errors.length > 0) {
      console.warn('Paper upload errors:', errors)
      // Don't show errors for papers, just log them
    }
  }

  function resetForm() {
    setTaskName('')
    setTaskDescription('')
    setTaskFormat('txt')
    setPaperEntries([])
    setMessage(null)
    setCreatedTaskName(null)
    resetNewPaperForm()
    setShowAddPaperModal(false)
  }

  function goToTask() {
    if (createdTaskName) {
      if (taskType === 'solving') {
        navigate(`/solve?problem=${encodeURIComponent(createdTaskName)}`)
      } else {
        navigate(`/write?draft=${encodeURIComponent(createdTaskName)}`)
      }
    }
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="app-title">
          🚀 Create New Task
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {!createdTaskName ? (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Task Type Selection */}
          <div className="input-group">
            <label>Task Type:</label>
            <select value={taskType} onChange={e => setTaskType(e.target.value as 'solving' | 'writing')}>
              <option value="solving">Problem Solving</option>
              <option value="writing">Paper Writing</option>
            </select>
          </div>

          {/* Task Details */}
          <div className="input-group">
            <label>Task Name:</label>
            <input
              type="text"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="e.g., Graph Coloring Problem"
              style={{ flex: 1 }}
            />
          </div>


          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              {taskType === 'solving' ? 'Task Description:' : 'Paper Writing Instructions:'}
            </label>
            <textarea
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              placeholder={
                taskType === 'solving'
                  ? "Describe the problem you want to solve. Be specific about the goals, constraints, and expected outcomes."
                  : "Describe the paper writing task. Include the research question, key contributions, target venue, and any specific requirements. This will be given to the AI in every round."
              }
              rows={6}
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Initial Draft - Only for writing tasks */}
          {taskType === 'writing' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Initial Draft (LaTeX/Markdown):
              </label>
              <textarea
                value={initialDraft}
                onChange={e => setInitialDraft(e.target.value)}
                placeholder="Paste your initial draft here (LaTeX or Markdown). This will be the starting point for iterative improvements."
                rows={12}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          {/* Simplified Paper Management Section */}
          <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>📚 Add Reference Papers (Optional)</h3>
            
            {/* Paper Type Dropdown */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Paper Type:
              </label>
              <select 
                value={newPaperType} 
                onChange={e => setNewPaperType(e.target.value as 'file' | 'text')}
                style={{ 
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="file">Upload File</option>
                <option value="text">Paste Text</option>
              </select>
            </div>

            {/* Upload/Text Input Area */}
            {newPaperType === 'file' ? (
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.tex"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewPaperFile(e.target.files[0])
                    }
                  }}
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px'
                  }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  value={newPaperText}
                  onChange={e => setNewPaperText(e.target.value)}
                  placeholder="Paste your text content here (txt, md, or tex format supported)"
                  rows={6}
                  data-gramm="false"
                  data-gramm_editor="false"
                  data-enable-grammarly="false"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}

            {/* Description Field */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={newPaperDescription}
                onChange={e => setNewPaperDescription(e.target.value)}
                placeholder="Description of why this paper is relevant (optional)"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Add Paper Button */}
            <div style={{ marginBottom: '16px' }}>
              <button
                type="button"
                onClick={handleAddSinglePaper}
                className="btn btn-primary"
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                ➕ Add Paper
              </button>
            </div>

            {/* Papers List - Two items per row */}
            {paperEntries.length > 0 && (
              <div>
                <h4 style={{ margin: '16px 0 12px 0', fontSize: '16px' }}>Uploaded Papers ({paperEntries.length})</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  maxHeight: '300px', 
                  overflowY: 'auto' 
                }}>
                  {paperEntries.map((entry, index) => (
                    <React.Fragment key={entry.id}>
                      {/* Paper Download Link */}
                      <div style={{ 
                        padding: '8px 12px',
                        background: 'white',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '14px' }}>
                          {entry.type === 'file' ? '📄' : '📝'}
                        </span>
                        <button
                          type="button"
                          onClick={() => downloadPaper(entry)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0066cc',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '12px',
                            flex: 1,
                            textAlign: 'left',
                            padding: 0
                          }}
                          title="Click to download"
                        >
                          {entry.type === 'file' 
                            ? (entry.data as File).name
                            : entry.filename
                          }
                        </button>
                        <button
                          type="button"
                          onClick={() => removePaperEntry(index)}
                          style={{ 
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: '2px'
                          }}
                          title="Remove paper"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Description */}
                      <div style={{ 
                        padding: '8px 12px',
                        background: '#f8f9fa',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6',
                        fontSize: '12px',
                        color: '#6c757d'
                      }}>
                        {entry.description || 'No description'}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div className="control-buttons">
            <button
              className="btn btn-primary"
              onClick={createTask}
              disabled={loading}
            >
              {loading ? 'Creating...' : `Create ${taskType === 'solving' ? 'Problem' : 'Draft'}`}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // Success state
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h2>Task Created Successfully!</h2>
          <p style={{ marginBottom: '30px', color: '#6c757d' }}>
            Your {taskType === 'solving' ? 'problem' : 'writing task'} "{createdTaskName}" has been created.
          </p>
          
          <div className="control-buttons" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={goToTask}>
              Open {taskType === 'solving' ? 'Problem' : 'Draft'}
            </button>
            <button className="btn btn-secondary" onClick={resetForm}>
              Create Another Task
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Back to Overview
            </button>
          </div>
        </div>
      )}
    </div>
  )
}