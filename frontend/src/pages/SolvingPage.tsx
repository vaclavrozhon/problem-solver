/**
 * SolvingPage - Problem-Solving Research Interface
 * 
 * Main coordinator component for the research problem-solving interface.
 * This page has been refactored from a monolithic 1113-line component into
 * a clean coordinator that orchestrates multiple focused sub-components.
 * 
 * Architecture:
 * - ProblemSidebar: Displays problem list with status indicators
 * - ProblemDetails: Tabbed interface for Status/Conversations/Files
 * - DeleteModals: Confirmation dialogs for destructive operations
 * - Shared state management for coordination between components
 * 
 * Key Features:
 * - Real-time problem status monitoring with auto-refresh
 * - URL-based problem selection and navigation
 * - Comprehensive error handling and user feedback
 * - Global loading states and user interaction controls
 * - Modal-based confirmation for destructive operations
 * - Responsive layout with proper overflow handling
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProblemSidebar from '../components/solving/ProblemSidebar'
import ProblemDetails from '../components/solving/ProblemDetails'
import DeleteModals from '../components/solving/DeleteModals'
import { ProblemStatus, AppMessage } from '../components/solving/types'
import {
  listProblems,
  getStatus,
  runRound,
  stopProblem,
  deleteRound,
  deleteProblem,
  resetProblem
} from '../api'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SolvingPage() {
  // =============================================================================
  // URL AND NAVIGATION STATE
  // =============================================================================
  
  /** React Router navigation hook */
  const navigate = useNavigate()
  
  /** URL search parameters for problem selection */
  const [searchParams] = useSearchParams()

  // =============================================================================
  // CORE APPLICATION STATE
  // =============================================================================
  
  /** List of all available problems */
  const [problems, setProblems] = useState<string[]>([])
  
  /** Currently selected problem name */
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null)
  
  /** Map of problem names to their current status data */
  const [statusMap, setStatusMap] = useState<Record<string, ProblemStatus>>({})
  
  /** Global loading state for major operations */
  const [loading, setLoading] = useState(false)
  
  /** Global message display for user feedback */
  const [message, setMessage] = useState<AppMessage | null>(null)
  
  /** Auto-refresh enabled state (always true for this interface) */
  const [autoRefresh] = useState(true)

  // =============================================================================
  // MODAL STATE MANAGEMENT  
  // =============================================================================
  
  
  /** Delete problem modal visibility */
  const [showDeleteProblemModal, setShowDeleteProblemModal] = useState(false)
  
  /** Reset problem modal visibility */
  const [showResetProblemModal, setShowResetProblemModal] = useState(false)
  
  /** Problem name queued for deletion */
  const [problemToDelete, setProblemToDelete] = useState<string | null>(null)
  
  /** Problem name queued for reset */
  const [problemToReset, setProblemToReset] = useState<string | null>(null)

  // =============================================================================
  // DERIVED STATE
  // =============================================================================
  
  /** Get current problem status for the selected problem */
  const currentProblemStatus = selectedProblem ? statusMap[selectedProblem] : undefined

  // =============================================================================
  // INITIALIZATION EFFECTS
  // =============================================================================
  
  /** Load problems on component mount */
  useEffect(() => {
    loadProblems()
  }, [])

  /** Handle URL parameter-based problem selection */
  useEffect(() => {
    const problemFromUrl = searchParams.get('problem')
    if (problemFromUrl && problems.includes(problemFromUrl) && selectedProblem !== problemFromUrl) {
      setSelectedProblem(problemFromUrl)
    }
  }, [problems, searchParams, selectedProblem])

  /** Auto-refresh status for all problems */
  useEffect(() => {
    if (!autoRefresh || problems.length === 0) return

    const interval = setInterval(() => {
      refreshAllStatuses()
    }, 2000) // Refresh every 2 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, problems])

  /** Clear messages after 5 seconds */
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // =============================================================================
  // API FUNCTIONS
  // =============================================================================

  /**
   * Loads the complete list of problems from the backend
   */
  const loadProblems = async () => {
    try {
      setLoading(true)
      const problemList = await listProblems()
      setProblems(problemList)
      
      // Load status for all problems
      await refreshAllStatuses(problemList)
      
    } catch (error) {
      console.error('Failed to load problems:', error)
      setMessage({ 
        type: 'error', 
        text: 'Failed to load problems. Please check your connection.' 
      })
      setProblems([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Refreshes status for all problems (or provided list)
   */
  const refreshAllStatuses = async (problemList: string[] = problems) => {
    if (problemList.length === 0) return

    try {
      // Fetch status for all problems in parallel
      const statusPromises = problemList.map(async (problem) => {
        try {
          const status = await getStatus(problem)
          return { problem, status }
        } catch (error) {
          console.error(`Failed to get status for ${problem}:`, error)
          return { problem, status: null }
        }
      })

      const results = await Promise.all(statusPromises)
      
      // Update status map with results
      const newStatusMap: Record<string, ProblemStatus> = {}
      results.forEach(({ problem, status }) => {
        if (status) {
          newStatusMap[problem] = status
        }
      })

      setStatusMap(prev => ({ ...prev, ...newStatusMap }))

    } catch (error) {
      console.error('Failed to refresh statuses:', error)
    }
  }

  /**
   * Starts a research run for the selected problem
   */
  const handleRunStart = async () => {
    if (!selectedProblem) return
    
    setLoading(true)
    try {
      // The actual run parameters will be handled by StatusPanel
      // This is just a coordination callback
      setMessage({ 
        type: 'info', 
        text: `Starting research for "${selectedProblem}"...` 
      })
      
      // Trigger immediate status refresh
      setTimeout(() => {
        if (selectedProblem) {
          getStatus(selectedProblem).then(status => {
            setStatusMap(prev => ({ ...prev, [selectedProblem]: status }))
          })
        }
      }, 1000)
      
    } catch (error) {
      console.error('Run start coordination failed:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Stops the current research run
   */
  const handleStop = async () => {
    if (!selectedProblem) return
    
    setLoading(true)
    try {
      await stopProblem(selectedProblem)
      setMessage({ 
        type: 'success', 
        text: `Stopped research for "${selectedProblem}"` 
      })
      
      // Refresh status after stopping
      setTimeout(() => {
        if (selectedProblem) {
          getStatus(selectedProblem).then(status => {
            setStatusMap(prev => ({ ...prev, [selectedProblem]: status }))
          })
        }
      }, 1000)
      
    } catch (error: any) {
      console.error('Failed to stop problem:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to stop research' 
      })
    } finally {
      setLoading(false)
    }
  }


  /**
   * Handles complete problem deletion
   */
  const handleDeleteProblem = async () => {
    if (!problemToDelete) return
    
    setLoading(true)
    try {
      await deleteProblem(problemToDelete)
      setMessage({ 
        type: 'success', 
        text: `Problem "${problemToDelete}" deleted successfully` 
      })
      
      // Clear selection if deleted problem was selected
      if (selectedProblem === problemToDelete) {
        selectProblem(null)
      }
      
      // Reset modal state
      setShowDeleteProblemModal(false)
      setProblemToDelete(null)
      
      // Refresh problem list
      await loadProblems()
      
    } catch (error: any) {
      console.error('Failed to delete problem:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to delete problem' 
      })
      setShowDeleteProblemModal(false)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles problem reset (keeps task but deletes all interactions)
   */
  const handleResetProblem = async () => {
    if (!problemToReset) return
    
    setLoading(true)
    try {
      await resetProblem(problemToReset)
      setMessage({ 
        type: 'success', 
        text: `Problem "${problemToReset}" has been reset. Task preserved, all interactions cleared.` 
      })
      
      // Reset modal state
      setShowResetProblemModal(false)
      setProblemToReset(null)
      
      // Refresh status for the reset problem
      if (selectedProblem === problemToReset) {
        setTimeout(() => {
          if (selectedProblem) {
            getStatus(selectedProblem).then(status => {
              setStatusMap(prev => ({ ...prev, [selectedProblem]: status }))
            })
          }
        }, 1000)
      }
      
      // Refresh all statuses
      setTimeout(() => {
        refreshAllStatuses()
      }, 1500)
      
    } catch (error: any) {
      console.error('Failed to reset problem:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to reset problem' 
      })
      setShowResetProblemModal(false)
    } finally {
      setLoading(false)
    }
  }

  // =============================================================================
  // UI EVENT HANDLERS
  // =============================================================================

  /**
   * Handles problem selection and URL updates
   */
  const selectProblem = (problemName: string | null) => {
    setSelectedProblem(problemName)
    
    // Update URL to reflect selection
    if (problemName) {
      navigate(`/solve?problem=${encodeURIComponent(problemName)}`)
    } else {
      navigate('/solve')
    }
  }


  /**
   * Opens delete problem modal
   */
  const openDeleteProblemModal = () => {
    if (selectedProblem) {
      setProblemToDelete(selectedProblem)
      setShowDeleteProblemModal(true)
    }
  }

  /**
   * Opens reset problem modal
   */
  const openResetProblemModal = () => {
    if (selectedProblem) {
      setProblemToReset(selectedProblem)
      setShowResetProblemModal(true)
    }
  }


  /**
   * Closes delete problem modal
   */
  const closeDeleteProblemModal = () => {
    setShowDeleteProblemModal(false)
    setProblemToDelete(null)
  }

  /**
   * Closes reset problem modal
   */
  const closeResetProblemModal = () => {
    setShowResetProblemModal(false)
    setProblemToReset(null)
  }

  /**
   * Handles deleting a specific round
   */
  const handleDeleteRound = async (roundName: string) => {
    if (!selectedProblem) return

    setLoading(true)
    try {
      await deleteRound(selectedProblem, roundName)
      setMessage({
        type: 'success',
        text: `Round "${roundName}" deleted successfully`
      })

      // Refresh status for the current problem
      if (selectedProblem) {
        setTimeout(() => {
          getStatus(selectedProblem).then(status => {
            setStatusMap(prev => ({ ...prev, [selectedProblem]: status }))
          })
        }, 500) // Small delay to allow backend to process
      }

    } catch (error: any) {
      console.error('Failed to delete round:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to delete round'
      })
    } finally {
      setLoading(false)
    }
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Renders global metrics header
   */
  const renderMetrics = () => {
    const runningCount = problems.filter(p => {
      const status = statusMap[p]
      return status?.overall.is_running && status.overall.phase !== 'idle'
    }).length

    const totalRounds = problems.reduce((sum, p) => {
      const status = statusMap[p]
      return sum + (status?.overall.current_round || 0)
    }, 0)

    return (
      <div className="metrics-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div className="metric-card" style={{ 
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div className="metric-label" style={{ fontSize: '12px', color: '#6c757d' }}>
            Total Problems
          </div>
          <div className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#495057' }}>
            {problems.length}
          </div>
        </div>
        <div className="metric-card" style={{ 
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div className="metric-label" style={{ fontSize: '12px', color: '#6c757d' }}>
            Currently Running
          </div>
          <div className="metric-value" style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: runningCount > 0 ? '#28a745' : '#495057' 
          }}>
            {runningCount}
          </div>
        </div>
        <div className="metric-card" style={{ 
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div className="metric-label" style={{ fontSize: '12px', color: '#6c757d' }}>
            Total Rounds
          </div>
          <div className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#495057' }}>
            {totalRounds}
          </div>
        </div>
      </div>
    )
  }

  /**
   * Renders global messages
   */
  const renderGlobalMessage = () => {
    if (!message) return null

    return (
      <div 
        className={`alert alert-${message.type}`}
        style={{
          marginBottom: '20px',
          padding: '12px 16px',
          borderRadius: '6px',
          border: `1px solid ${
            message.type === 'error' ? '#f5c6cb' :
            message.type === 'success' ? '#c3e6cb' :
            message.type === 'warning' ? '#ffeaa7' :
            '#bee5eb'
          }`,
          backgroundColor: 
            message.type === 'error' ? '#f8d7da' :
            message.type === 'success' ? '#d4edda' :
            message.type === 'warning' ? '#fff3cd' :
            '#d1ecf1',
          color:
            message.type === 'error' ? '#721c24' :
            message.type === 'success' ? '#155724' :
            message.type === 'warning' ? '#856404' :
            '#0c5460',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>
          {message.type === 'error' ? '❌' :
           message.type === 'success' ? '✅' :
           message.type === 'warning' ? '⚠️' :
           'ℹ️'}
        </span>
        <span style={{ flex: 1 }}>{message.text}</span>
        <button
          onClick={() => setMessage(null)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0 4px'
          }}
          title="Dismiss"
        >
          ×
        </button>
      </div>
    )
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className="solving-page" style={{ 
      minHeight: '100vh',
      background: '#f8f9fa'
    }}>
      {/* Header section */}
      <div style={{ 
        padding: '20px',
        background: 'white',
        borderBottom: '1px solid #e9ecef'
      }}>
        {renderMetrics()}
        {renderGlobalMessage()}
      </div>

      {/* Main content area */}
      <div style={{ 
        display: 'flex',
        padding: '20px',
        gap: '20px'
      }}>
        {/* Problem sidebar */}
        <ProblemSidebar
          problems={problems}
          selectedProblem={selectedProblem}
          statusMap={statusMap}
          onProblemSelect={selectProblem}
          loading={loading}
        />

        {/* Main content */}
        <ProblemDetails
          problemName={selectedProblem}
          status={currentProblemStatus}
          loading={loading}
          message={null} // Use global message instead
          setMessage={setMessage}
          onRunStart={handleRunStart}
          onStop={handleStop}
          onDeleteProblem={openDeleteProblemModal}
          onResetProblem={openResetProblemModal}
          onDeleteRound={handleDeleteRound}
        />
      </div>

      {/* Delete modals */}
      <DeleteModals
        showDeleteProblemModal={showDeleteProblemModal}
        showResetProblemModal={showResetProblemModal}
        problemToDelete={problemToDelete}
        problemToReset={problemToReset}
        loading={loading}
        onCloseDeleteProblemModal={closeDeleteProblemModal}
        onCloseResetProblemModal={closeResetProblemModal}
        onDeleteProblem={handleDeleteProblem}
        onResetProblem={handleResetProblem}
      />
    </div>
  )
}