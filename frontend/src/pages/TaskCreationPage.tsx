import React, { useState } from 'react'
import { createProblem, createDraft, uploadProblemPaper, uploadDraftPaper, addProblemPaperFromUrl, addDraftPaperFromUrl } from '../api'
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
  
  // Paper management state
  const [paperFiles, setPaperFiles] = useState<File[]>([])
  const [paperUrls, setPaperUrls] = useState<string[]>([''])
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [createdTaskName, setCreatedTaskName] = useState<string | null>(null)

  function addPaperUrl() {
    setPaperUrls([...paperUrls, ''])
  }

  function updatePaperUrl(index: number, url: string) {
    const newUrls = [...paperUrls]
    newUrls[index] = url
    setPaperUrls(newUrls)
  }

  function removePaperUrl(index: number) {
    setPaperUrls(paperUrls.filter((_, i) => i !== index))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setPaperFiles([...paperFiles, ...Array.from(e.target.files)])
    }
  }

  function removeFile(index: number) {
    setPaperFiles(paperFiles.filter((_, i) => i !== index))
  }

  async function createTask() {
    if (!taskName.trim() || !taskDescription.trim()) {
      setMessage({ type: 'error', text: 'Please fill in task name and description' })
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
        result = await createDraft(taskName, taskDescription)
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

    // Upload files
    for (const file of paperFiles) {
      try {
        if (taskType === 'solving') {
          await uploadProblemPaper(taskName, file)
        } else {
          await uploadDraftPaper(taskName, file)
        }
      } catch (err: any) {
        errors.push(`Failed to upload ${file.name}: ${err.message}`)
      }
    }

    // Download from URLs
    for (const url of paperUrls) {
      if (url.trim()) {
        try {
          if (taskType === 'solving') {
            await addProblemPaperFromUrl(taskName, url.trim())
          } else {
            await addDraftPaperFromUrl(taskName, url.trim())
          }
        } catch (err: any) {
          errors.push(`Failed to download from ${url}: ${err.message}`)
        }
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
    setPaperFiles([])
    setPaperUrls([''])
    setMessage(null)
    setCreatedTaskName(null)
  }

  function goToTask() {
    if (createdTaskName) {
      if (taskType === 'solving') {
        navigate(`/solving/${createdTaskName}`)
      } else {
        navigate(`/writing/${createdTaskName}`)
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

          {taskType === 'solving' && (
            <div className="input-group">
              <label>Task Format:</label>
              <select value={taskFormat} onChange={e => setTaskFormat(e.target.value as 'txt' | 'tex' | 'md')}>
                <option value="txt">Plain Text (.txt)</option>
                <option value="tex">LaTeX (.tex)</option>
                <option value="md">Markdown (.md)</option>
              </select>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Task Description:
            </label>
            <textarea
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              placeholder={
                taskType === 'solving'
                  ? "Describe the problem you want to solve. Be specific about the goals, constraints, and expected outcomes."
                  : "Describe the paper you want to write. Include the research question, key contributions, and target venue."
              }
              rows={6}
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

          {/* Paper Upload Section */}
          <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Add Reference Papers (Optional)</h3>
            
            {/* File Upload */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Upload PDF files:</label>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileChange}
                style={{ marginBottom: '10px' }}
              />
              {paperFiles.length > 0 && (
                <div>
                  <strong>Files to upload:</strong>
                  {paperFiles.map((file, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '13px' }}>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '2px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* URL Input */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Or add papers by URL:</label>
              {paperUrls.map((url, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="url"
                    value={url}
                    onChange={e => updatePaperUrl(index, e.target.value)}
                    placeholder="https://arxiv.org/pdf/..."
                    style={{ flex: 1, padding: '6px 12px', border: '1px solid #ced4da', borderRadius: '4px' }}
                  />
                  {paperUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePaperUrl(index)}
                      style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '4px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPaperUrl}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '4px 8px' }}
              >
                + Add Another URL
              </button>
            </div>
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