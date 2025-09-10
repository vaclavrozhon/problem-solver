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
import { listFiles, getFileContent, getFileVersions } from '../../api'

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
  

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================
  
  /** Check if current file supports versioning */
  const isVersionedFile = selectedFile && ['notes.md', 'proofs.md', 'output.md'].includes(selectedFile)
  
  /** Check if current file is markdown */
  const isMarkdownFile = selectedFile?.endsWith('.md') || false

  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  /** Load files when component mounts or problem changes */
  useEffect(() => {
    if (problemName) {
      loadFiles()
    }
  }, [problemName])


  // =============================================================================
  // API FUNCTIONS
  // =============================================================================

  /**
   * Loads the file list from the backend
   */
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
      
      // Load versions for versioned files
      if (['notes.md', 'proofs.md', 'output.md'].includes(filePath) && selectedFile !== filePath) {
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

  // =============================================================================
  // UI HELPERS
  // =============================================================================

  /**
   * Simple markdown renderer for basic formatting
   */
  const renderMarkdown = (content: string): string => {
    return content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')  
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/\n/gim, '<br>')
  }

  /**
   * Gets appropriate icon for file type
   */
  const getFileIcon = (file: FileInfo): string => {
    switch (file.type) {
      case 'markdown': return '📝'
      case 'paper': return '📄'
      case 'pdf': return '📋'
      default: return '📄'
    }
  }
  
  /**
   * Checks if a file is a parsed PDF (exists in papers_parsed directory)
   */
  const getParsedFilePath = (filePath: string): string | null => {
    if (filePath.startsWith('papers/') && filePath.endsWith('.pdf')) {
      const filename = filePath.replace('papers/', '').replace('.pdf', '.txt')
      return `papers_parsed/${filename}`
    }
    return null
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
   * Categorizes files into input and output groups
   */
  const categorizeFiles = () => {
    const inputFiles = files.filter(file => 
      file.path.startsWith('task.') || 
      file.path.startsWith('papers/') ||
      file.path.startsWith('papers_parsed/')
    )
    
    const outputFiles = files.filter(file => 
      file.name === 'notes.md' || 
      file.name === 'proofs.md' || 
      file.name === 'output.md' ||
      file.path.startsWith('runs/')
    )
    
    return { inputFiles, outputFiles }
  }

  /**
   * Renders a file button
   */
  const renderFileButton = (file, isFirst = true) => {
    const parsedFilePath = getParsedFilePath(file.path)
    
    return (
      <div key={file.path} style={{ marginBottom: '6px' }}>
        {/* Original File */}
        <button
          onClick={() => loadFileContent(file.path, 'current', file)}
          style={{
            background: selectedFile === file.path ? '#e3f2fd' : 'transparent',
            border: '1px solid #ddd',
            padding: '8px 12px',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            borderRadius: file.type === 'paper' && parsedFilePath ? '4px 4px 0 0' : '4px',
            fontSize: '12px',
            borderBottom: file.type === 'paper' && parsedFilePath ? '1px solid #e0e0e0' : '1px solid #ddd'
          }}
        >
          <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {getFileIcon(file)}
            {file.name}
            {file.type === 'paper' && parsedFilePath && (
              <span style={{ fontSize: '10px', color: '#28a745', fontWeight: 'normal' }}>
                📄→📝
              </span>
            )}
          </div>
          <div style={{ fontSize: '10px', color: '#666' }}>
            {file.type === 'paper' && file.name.toLowerCase().endsWith('.pdf') ? 'Original PDF' : formatFileSize(file.size)} • {file.modified}
          </div>
          {file.description && (
            <div style={{ 
              fontSize: '11px', 
              color: '#555', 
              marginTop: '4px',
              fontStyle: 'italic',
              background: '#f8f9fa',
              padding: '2px 4px',
              borderRadius: '2px',
              border: '1px solid #e9ecef'
            }}>
              {file.description}
            </div>
          )}
        </button>
        
        {/* Parsed Content Button (if available) */}
        {file.type === 'paper' && parsedFilePath && (
          <button
            onClick={() => loadFileContent(parsedFilePath, 'current', file)}
            style={{
              background: selectedFile === parsedFilePath ? '#e8f5e8' : '#f8f9fa',
              border: '1px solid #ddd',
              borderTop: 'none',
              padding: '6px 12px',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: '0 0 4px 4px',
              fontSize: '11px'
            }}
            title="View parsed text content (AI-readable)"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#28a745' }}>
              <span>📝</span>
              <span>Parsed Text Content</span>
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>
              AI-extracted text from PDF
            </div>
          </button>
        )}
        
        {/* Description for parsed content */}
        {file.type === 'paper' && parsedFilePath && file.description && (
          <div style={{ 
            fontSize: '10px', 
            color: '#155724', 
            background: '#d4edda',
            padding: '3px 6px',
            borderRadius: '3px',
            fontStyle: 'italic',
            marginTop: '2px'
          }}>
            {file.description}
          </div>
        )}
      </div>
    )
  }

  /**
   * Renders the file list sidebar
   */
  const renderFileList = () => {
    const { inputFiles, outputFiles } = categorizeFiles()
    
    return (
      <div style={{ width: '300px', borderRight: '1px solid #ddd', paddingRight: '16px' }}>
        <h4>Problem Files</h4>
        
        {loading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p style={{ color: '#666', fontSize: '14px' }}>No files found</p>
        ) : (
          <div>
            {/* Input Files Section */}
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2563eb',
                margin: '0 0 8px 0',
                padding: '4px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                📥 Input
              </h5>
              <div style={{ listStyle: 'none', padding: 0 }}>
                {inputFiles.map((file) => renderFileButton(file))}
              </div>
            </div>

            {/* Output Files Section */}
            <div>
              <h5 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#dc2626',
                margin: '0 0 8px 0',
                padding: '4px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                📤 Output
              </h5>
              <div style={{ listStyle: 'none', padding: 0 }}>
                {outputFiles.map((file) => renderFileButton(file))}
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
    <div style={{ flex: 1, paddingLeft: '16px', overflow: 'auto' }}>
      {selectedFile ? (
        <div>
          {/* File header with version selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <h4 style={{ margin: 0 }}>
              {selectedFile}
              {selectedFile.startsWith('papers_parsed/') && (
                <span style={{ 
                  marginLeft: '8px',
                  fontSize: '12px',
                  color: '#28a745',
                  background: '#d4edda',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 'normal'
                }}>
                  📝 Parsed Content
                </span>
              )}
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
          </div>
          
          {/* Parsed content info */}
          {selectedFile.startsWith('papers_parsed/') && (
            <div style={{ 
              background: '#e8f5e8',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              <div style={{ fontWeight: 'bold', color: '#155724', marginBottom: '4px' }}>
                📄 AI-Extracted PDF Content
              </div>
              <div style={{ color: '#155724' }}>
                This is the text content extracted from the original PDF file for AI analysis. 
                The content has been processed to be machine-readable while preserving the paper's structure and information.
              </div>
            </div>
          )}
          
          {/* Paper description field */}
          {selectedFileInfo?.description && (selectedFileInfo.type === 'paper' || selectedFile?.startsWith('papers/')) && (
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
              <div style={{ 
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '3px',
                padding: '8px',
                fontSize: '13px',
                color: '#333',
                lineHeight: '1.4'
              }}>
                {selectedFileInfo.description}
              </div>
            </div>
          )}
          
          {/* File content */}
          {loading ? (
            <p>Loading file content...</p>
          ) : (
            <div>
              {isMarkdownFile ? (
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
  )

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className="files-panel">
      <div style={{ display: 'flex', height: '600px' }}>
        {renderFileList()}
        {renderFileViewer()}
      </div>
    </div>
  )
}