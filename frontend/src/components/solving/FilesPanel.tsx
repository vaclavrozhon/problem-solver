/**
 * FilesPanel Component
 * 
 * Provides a file browser interface for research problems with version control
 * for notes.md, proofs.md, and output.md files. Users can browse all problem files and
 * view different versions of versioned files.
 * 
 * Features:
 * - File listing with metadata (size, modified date, type)
 * - Version dropdown for versioned files (notes.md, proofs.md, output.md)
 * - Content viewer with markdown rendering
 * - Paper download functionality
 * - File type icons and appropriate handling
 */

import React, { useState, useEffect } from 'react'
import { ProblemComponentProps, FileInfo, FileVersion } from './types'
import { listFiles, getFileContent, getFileVersions, uploadProblemPaper, uploadProblemTextContent, updateBaseFileByName } from '../../api'

// =============================================================================
// INTERFACES
// =============================================================================

interface FilesPanelProps extends ProblemComponentProps {
  /** Optional callback when file is selected (for external coordination) */
  onFileSelect?: (fileName: string) => void
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function FilesPanel({ problemName, onFileSelect }: FilesPanelProps) {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  /** List of all files in the problem directory */
  const [files, setFiles] = useState<FileInfo[]>([])
  
  /** Currently selected file path */
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  
  /** Currently selected file object (for metadata like description) */
  const [selectedFileInfo, setSelectedFileInfo] = useState<FileInfo | null>(null)
  
  /** Content of the selected file */
  const [fileContent, setFileContent] = useState<string>('')
  
  /** Available versions for versioned files */
  const [fileVersions, setFileVersions] = useState<FileVersion[]>([])
  
  /** Currently selected version */
  const [selectedVersion, setSelectedVersion] = useState<string>('current')
  
  /** Loading states */
  const [loading, setLoading] = useState(false)
  const [versionsLoading, setVersionsLoading] = useState(false)
  
  /** Edit mode state */
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState<string>('')
  const [editedDescription, setEditedDescription] = useState<string>('')
  const [saving, setSaving] = useState(false)
  
  /** Round selection for metadata filtering */
  const [selectedRound, setSelectedRound] = useState<string>('latest')
  
  /** Upload papers state - inline form like TaskCreationPage */
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [newPaperType, setNewPaperType] = useState<'file' | 'text'>('file')
  const [newPaperFile, setNewPaperFile] = useState<File | null>(null)
  const [newPaperText, setNewPaperText] = useState('')
  const [newPaperDescription, setNewPaperDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================
  
  /** Check if current file supports versioning */
  const isVersionedFile = selectedFile && ['notes','proofs','output'].includes(selectedFile)

  // =============================================================================
  // API FUNCTIONS
  // =============================================================================

  /**
   * Loads content for a specific file and version
   */
  const loadFileContent = async (filePath: string, version: string = 'current', fileInfo?: FileInfo) => {
    try {
      setLoading(true)
      
      // Reset versions when switching files
      if (selectedFile !== filePath) {
        setFileVersions([])
        setSelectedVersion('current')
      }
      
      // Load versions for versioned files (check by file_type instead of filename)
      if (['prover_output', 'verifier_output', 'summarizer_output'].includes(filePath) && selectedFile !== filePath) {
        try {
          setVersionsLoading(true)
          const versionsResult = await getFileVersions(problemName, filePath)
          setFileVersions(versionsResult.versions || [])
        } catch (err) {
          console.error('Failed to load versions:', err)
          setFileVersions([])
        } finally {
          setVersionsLoading(false)
        }
      }
      
      // Load file content
      const result = await getFileContent(
        problemName, 
        filePath, 
        version === 'current' ? undefined : version
      )
      
      setFileContent(result.content)
      setSelectedFile(filePath)
      setSelectedVersion(version)
      
      // Store the file info if provided, or find it from files list
      if (fileInfo) {
        setSelectedFileInfo(fileInfo)
      } else {
        const foundFile = files.find(f => f.path === filePath)
        setSelectedFileInfo(foundFile || null)
      }
      
      // Notify parent component
      onFileSelect?.(filePath)
      
      // Reset edit mode when switching files
      setIsEditing(false)
      setEditedContent('')
      setEditedDescription('')

    } catch (err) {
      console.error('Failed to load file:', err)
      setFileContent('Error loading file content')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Loads a specific version of the current file
   */
  const loadFileVersion = async (version: string) => {
    if (selectedFile) {
      await loadFileContent(selectedFile, version)
    }
  }

  /**
   * Handles adding a single paper (from TaskCreationPage pattern)
   */
  const handleAddSinglePaper = async () => {
    try {
      setUploading(true)
      
      if (!problemName) {
        alert('No problem selected')
        return
      }
      if (newPaperType === 'file' && newPaperFile) {
        // Upload file
        await uploadProblemPaper(problemName, newPaperFile, newPaperDescription)
      } else if (newPaperType === 'text' && newPaperText.trim()) {
        // Upload text content using the proper API function
        const filename = `text_${Date.now()}.txt`
        await uploadProblemTextContent(problemName, newPaperText, filename, newPaperDescription)
      } else {
        alert('Please select a file or enter text content.')
        return
      }
      
      // Reset form and refresh
      resetNewPaperForm()
      setShowUploadForm(false)
      await loadFiles()
      
    } catch (err) {
      console.error('Failed to upload paper:', err)
      alert('Failed to upload paper. Please try again.')
    } finally {
      setUploading(false)
    }
  }
  
  /**
   * Resets the paper upload form (from TaskCreationPage pattern)
   */
  const resetNewPaperForm = () => {
    setNewPaperFile(null)
    setNewPaperText('')
    setNewPaperDescription('')
    setNewPaperType('file')
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  // =============================================================================
  // UI HELPERS
  // =============================================================================

  /**
   * Gets appropriate icon for file type
   */
  const getFileIcon = (file: any): string => {
    switch (file?.file_type) {
      case 'task': return '📋'
      case 'notes': return '📝'
      case 'proofs': return '🔬'
      case 'output': return '📊'
      case 'paper': return '📄'
      case 'prover_output': return '🤖'
      case 'verifier_output': return '✅'
      case 'summarizer_output': return '📝'
      default: return '📄'
    }
  }
  

  /**
   * Formats file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${Math.round(bytes / (1024 * 1024))} MB`
  }


  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Categorizes files into input, output, and metadata groups
   */
  const categorizeFiles = () => {
    const inputFiles = (files as any[]).filter(file =>
      file?.file_type === 'task' ||
      file?.file_type === 'paper'
    )

    const outputFiles = (files as any[]).filter(file =>
      file?.file_type === 'notes' ||
      file?.file_type === 'proofs' ||
      file?.file_type === 'output'
    )

    // Get all rounds from database (round > 0)
    const allRounds = [...new Set(
      (files as any[])
        .filter(file => (file?.round || 0) > 0)
        .map(file => `round-${String(file.round).padStart(4, '0')}`)
    )].sort().reverse() // Most recent first

    // Filter metadata files based on selected round
    let metadataFiles = (files as any[]).filter(file => (file?.round || 0) > 0)
    
    if (selectedRound !== 'all' && selectedRound !== 'latest') {
      // Filter to specific round - extract round number from selectedRound (e.g., "round-0001" -> 1)
      const roundNum = parseInt(selectedRound.replace('round-', ''))
      metadataFiles = metadataFiles.filter(file => (file?.round || 0) === roundNum)
    } else if (selectedRound === 'latest' && allRounds.length > 0) {
      // Show only the latest round
      const latestRoundStr = allRounds[0] // e.g., "round-0001"
      const latestRoundNum = parseInt(latestRoundStr.replace('round-', ''))
      metadataFiles = metadataFiles.filter(file => (file?.round || 0) === latestRoundNum)
    }
    
    return { inputFiles, outputFiles, metadataFiles, allRounds }
  }

  /**
   * Renders a file button
   */
  const renderFileButton = (file: any, isFirst = true) => {
    return (
      <div key={file?.id || `${file?.file_type}-${file?.round}`}>
        {/* Original File */}
        <button
          onClick={() => loadFileContent(file?.file_type, 'current', file as any)}>
          <div>
            {getFileIcon(file)}
            {file?.file_name || file?.file_type || 'Unknown file'}
          </div>
          <div>
            {file?.file_type === 'paper' && file?.file_name?.toLowerCase().endsWith('.pdf') ? 'Original PDF' : formatFileSize(file?.size)} • {file?.created_at}
          </div>
          {file?.description && (
            <div>
              {file?.description}
            </div>
          )}
        </button>
      </div>
    )
  }

  /**
   * Renders the file list sidebar
   */
  const renderFileList = () => {
    const { inputFiles, outputFiles, metadataFiles, allRounds } = categorizeFiles()
    
    return (
      <div>
        <h4>Problem Files</h4>
        
        {loading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p style={{ color: '#666', fontSize: '14px' }}>No files found</p>
        ) : (
          <div>
            {/* Input Files Section */}
            <div >
              <div >
                <h5>
                  📥 Input
                </h5>
                <button
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  title={showUploadForm ? 'Cancel upload' : 'Upload papers'}
                >
                  {showUploadForm ? '✕ Cancel' : '📄 Upload papers'}
                </button>
              </div>
              <div style={{ listStyle: 'none', padding: 0 }}>
                {/* Upload Form - shown inline like TaskCreationPage */}
                {showUploadForm && (
                  <div>
                    {/* Paper Type Dropdown */}
                    <div>
                      <label>
                        Paper Type:
                      </label>
                      <select 
                        value={newPaperType} 
                        onChange={e => setNewPaperType(e.target.value as 'file' | 'text')}
                        style={{ 
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                        disabled={uploading}
                      >
                        <option value="file">Upload File</option>
                        <option value="text">Paste Text</option>
                      </select>
                    </div>

                    {/* Upload/Text Input Area */}
                    {newPaperType === 'file' ? (
                      <div>
                        <label>
                          Select File:
                        </label>
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
                            padding: '6px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                          disabled={uploading}
                        />
                        {!newPaperFile && (
                          <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                            No file chosen
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '12px' }}>
                          Text Content:
                        </label>
                        <textarea
                          value={newPaperText}
                          onChange={e => setNewPaperText(e.target.value)}
                          placeholder="Paste your text content here (txt, md, or tex format supported)"
                          rows={4}
                          disabled={uploading}
                        />
                      </div>
                    )}

                    {/* Description Field */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '12px' }}>
                        Description (optional):
                      </label>
                      <input
                        type="text"
                        value={newPaperDescription}
                        onChange={e => setNewPaperDescription(e.target.value)}
                        placeholder="Brief description of this paper..."
                        disabled={uploading}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          resetNewPaperForm()
                          setShowUploadForm(false)
                        }}
                        disabled={uploading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSinglePaper}
                        disabled={uploading || (newPaperType === 'file' && !newPaperFile) || (newPaperType === 'text' && !newPaperText.trim())}
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                )}
                
                {inputFiles.map((file) => renderFileButton(file))}
              </div>
            </div>

            {/* Output Files Section */}
            <div style={{ marginBottom: '20px' }}>
              <h5>
                📤 Output
              </h5>
              <div style={{ listStyle: 'none', padding: 0 }}>
                {outputFiles.map((file) => renderFileButton(file))}
              </div>
            </div>

            {/* Metadata Files Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h5 style={{ 
                  fontSize: '13px', 
                  fontWeight: 'bold', 
                  color: '#7c3aed',
                  margin: '0',
                  padding: '4px 0',
                  borderBottom: '1px solid #e5e7eb',
                  flex: 1
                }}>
                  🔧 Metadata
                </h5>
              </div>
              
              {/* Round selector */}
              {allRounds.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '12px' }}>
                    Round:
                  </label>
                  <select 
                    value={selectedRound} 
                    onChange={e => setSelectedRound(e.target.value)}
                    style={{ 
                      width: '100%',
                      padding: '4px 6px',
                      border: '1px solid #ced4da',
                      borderRadius: '3px',
                      fontSize: '11px',
                      background: 'white'
                    }}
                  >
                    <option value="latest">Latest Round</option>
                    <option value="all">All Rounds</option>
                    {allRounds.map(round => (
                      <option key={round} value={round}>
                        {round.replace('round-', 'Round ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div style={{ listStyle: 'none', padding: 0 }}>
                {metadataFiles.length > 0 ? (
                  metadataFiles.map((file) => renderFileButton(file))
                ) : (
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#666', 
                    fontStyle: 'italic',
                    padding: '8px 0'
                  }}>
                    No metadata files found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  /**
   * Renders the file content viewer
   */
  const renderFileViewer = () => (
    <div style={{ flex: 1, paddingLeft: '16px' }}>
      {selectedFile ? (
        <div>
          {/* File header with version selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <h4 style={{ margin: 0 }}>
              {selectedFile}
            </h4>
            
            {/* Version selector for versioned files */}
            {isVersionedFile && fileVersions.length > 0 && (
              <select 
                value={selectedVersion} 
                onChange={(e) => loadFileVersion(e.target.value)}
                disabled={versionsLoading}
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
            
            {versionsLoading && (
              <span style={{ fontSize: '11px', color: '#666' }}>Loading versions...</span>
            )}
            
            {/* Edit/Save/Cancel buttons */}
            <div style={{ marginLeft: 'auto' }}>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.6 : 1
                    }}
                  >
                    {saving ? 'Saving...' : '💾 Save'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.6 : 1
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditing}
                  disabled={loading}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  ✏️ Edit
                </button>
              )}
            </div>
          </div>
          
          
          {/* Paper description field */}
          {(selectedFileInfo?.type === 'paper' || selectedFile?.startsWith('papers/')) && (
            <div style={{ 
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              <div style={{ fontWeight: 'bold', color: '#8a6d3b', marginBottom: '8px' }}>
                📋 Paper Description
              </div>
              {isEditing ? (
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Enter paper description..."/>
              ) : (
                <div>
                  {selectedFileInfo?.description || 'No description provided'}
                </div>
              )}
            </div>
          )}
          
          {/* File content */}
          {loading ? (
            <p>Loading file content...</p>
          ) : isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Edit file content..."
            />
          ) : (
            <div>
              {isMarkdownFile ? (
                <div 
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(fileContent) }}
                />
              ) : (
                <pre>
                  {fileContent}
                </pre>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          Select a file to view its content
        </div>
      )}
    </div>
  )

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className="files-panel">
      <div style={{ display: 'flex', minHeight: '400px' }}>
        {renderFileList()}
        {renderFileViewer()}
      </div>
    </div>
  )
}