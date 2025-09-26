/**
 * ProblemSidebar Component
 * 
 * Displays a list of all available research problems with their current status.
 * This component serves as the main navigation for selecting and managing problems
 * within the research solving interface.
 * 
 * Features:
 * - Problem list with status indicators (running, stopped, error)
 * - Visual selection highlighting for current problem
 * - Round progress display for running problems
 * - Click-to-select navigation
 * - Status dots with consistent color coding
 * - Responsive layout with proper scrolling
 * - Empty state handling
 * - Error state display
 */

import React from 'react'
import { ProblemInfo, ProblemStatus } from './types'
import { getProblemInfo, getStatusClassName, getVerdictColor } from './utils'

// =============================================================================
// INTERFACES
// =============================================================================

interface ProblemSidebarProps {
  /** List of available problems with ids */
  problems: { id: number, name: string }[]
  
  /** Currently selected problem id */
  selectedProblemId: number | null
  
  /** Map of problem names to their status data */
  statusMap: Record<string, ProblemStatus>
  
  /** Callback when a problem is selected */
  onProblemSelect: (problemId: number | null) => void
  
  /** Loading state for operations */
  loading?: boolean
  
  /** Optional callback for problem deletion */
  onProblemDelete?: (problemName: string) => void
}

interface ProblemItemProps {
  problemId: number
  problemName: string
  problemInfo: ProblemInfo
  status?: ProblemStatus
  isSelected: boolean
  onClick: () => void
  onDelete?: (problemName: string) => void
  loading?: boolean
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProblemSidebar({
  problems,
  selectedProblemId,
  statusMap,
  onProblemSelect,
  loading = false,
  onProblemDelete
}: ProblemSidebarProps) {
  
  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================
  
  /** Calculate summary statistics */
  const runningCount = problems.filter(p => 
    getProblemInfo(p.name, statusMap[p.name]).status === 'running'
  ).length
  
  const totalRounds = problems.reduce((sum, p) => 
    sum + getProblemInfo(p.name, statusMap[p.name]).currentRound, 0
  )

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Handles problem selection
   */
  const handleProblemSelect = (problemId: number) => {
    if (!loading) {
      onProblemSelect(problemId)
    }
  }

  /**
   * Handles clicking outside problems to clear selection
   */
  const handleClearSelection = () => {
    if (!loading && selectedProblemId) {
      onProblemSelect(null)
    }
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Renders the sidebar header with statistics
   */
  const renderHeader = () => (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>Problems</h3>
    </div>
  )

  /**
   * Renders the empty state when no problems exist
   */
  const renderEmptyState = () => (
    <div style={{ 
      textAlign: 'center', 
      padding: '40px 20px',
      color: '#6c757d',
      background: '#f8f9fa',
      borderRadius: '6px',
      border: '1px solid #e9ecef'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>No Problems</div>
      <div style={{ fontSize: '14px' }}>Create a task to get started</div>
    </div>
  )

  /**
   * Renders the problem list
   */
  const renderProblemList = () => (
    <ul 
      className="problem-list" 
      style={{ 
        listStyle: 'none', 
        padding: 0, 
        margin: 0
      }}
    >
      {problems.map(({ id, name }) => {
        const problemInfo = getProblemInfo(name, statusMap[name])
        const isSelected = selectedProblemId === id
        
        return (
          <ProblemItem
            key={id}
            problemId={id}
            problemName={name}
            problemInfo={problemInfo}
            status={statusMap[name]}
            isSelected={isSelected}
            onClick={() => handleProblemSelect(id)}
            onDelete={onProblemDelete}
            loading={loading}
          />
        )
      })}
    </ul>
  )

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className="problem-sidebar">
      {renderHeader()}
      {problems.length === 0 ? renderEmptyState() : renderProblemList()}
    </div>
  )
}

// =============================================================================
// PROBLEM ITEM COMPONENT
// =============================================================================

/**
 * Individual problem item component
 * Displays a single problem with its status and selection state
 */
function ProblemItem({
  problemId,
  problemName,
  problemInfo,
  status,
  isSelected,
  onClick,
  onDelete,
  loading = false
}: ProblemItemProps) {
  
  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  /**
   * Handles problem item click
   */
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!loading) {
      onClick()
    }
  }

  /**
   * Handles delete button click (prevents propagation)
   */
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete && !loading) {
      onDelete(problemName)
    }
  }

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================
  
  /** Get appropriate status class name */
  const statusClass = getStatusClassName(problemInfo.status)
  
  /** Determine if we should show the round indicator */
  const showRoundIndicator = problemInfo.status === 'running' && problemInfo.currentRound > 0
  
  /** Calculate remaining rounds to finish */
  const remainingRounds = status?.overall.remaining_rounds || 0
  const showRemainingRounds = problemInfo.status === 'running' && remainingRounds > 0
  
  /** Get the latest verdict from the most recent round */
  const lastVerdict = status?.rounds && status.rounds.length > 0 
    ? status.rounds.reduce((latest, current) => 
        current.number > latest.number ? current : latest
      ).verdict
    : undefined
    
  /** Get the color for the verdict indicator */
  const verdictColor = getVerdictColor(lastVerdict)

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <li 
      key={problemId}
      className={`problem-item ${isSelected ? 'selected' : ''}`}
    >
      <div onClick={handleClick} style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`status-dot ${problemInfo.status}`}></span>
            <span>{problemName}</span>
          </div>
          <span 
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: verdictColor
            }}
            title={lastVerdict ? `Last verdict: ${lastVerdict}` : 'No verdict yet'}
          ></span>
        </div>
        {showRemainingRounds && (
          <div style={{ marginTop: '4px', marginLeft: '20px' }}>
            <span className="small-font" style={{ color: '#666' }}>
              ({remainingRounds} more round{remainingRounds !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>
    </li>
  )
}