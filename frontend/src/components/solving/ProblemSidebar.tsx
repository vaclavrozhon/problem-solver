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
import { getProblemInfo, getStatusClassName } from './utils'

// =============================================================================
// INTERFACES
// =============================================================================

interface ProblemSidebarProps {
  /** List of available problem names */
  problems: string[]
  
  /** Currently selected problem name */
  selectedProblem: string | null
  
  /** Map of problem names to their status data */
  statusMap: Record<string, ProblemStatus>
  
  /** Callback when a problem is selected */
  onProblemSelect: (problemName: string | null) => void
  
  /** Loading state for operations */
  loading?: boolean
  
  /** Optional callback for problem deletion */
  onProblemDelete?: (problemName: string) => void
}

interface ProblemItemProps {
  /** Problem name */
  problemName: string
  
  /** Problem information derived from status */
  problemInfo: ProblemInfo
  
  /** Whether this problem is currently selected */
  isSelected: boolean
  
  /** Click handler for problem selection */
  onClick: () => void
  
  /** Optional delete handler */
  onDelete?: (problemName: string) => void
  
  /** Loading state */
  loading?: boolean
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProblemSidebar({
  problems,
  selectedProblem,
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
    getProblemInfo(p, statusMap[p]).status === 'running'
  ).length
  
  const totalRounds = problems.reduce((sum, p) => 
    sum + getProblemInfo(p, statusMap[p]).currentRound, 0
  )

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Handles problem selection
   */
  const handleProblemSelect = (problemName: string) => {
    if (!loading) {
      onProblemSelect(problemName)
    }
  }

  /**
   * Handles clicking outside problems to clear selection
   */
  const handleClearSelection = () => {
    if (!loading && selectedProblem) {
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
      {problems.map(problemName => {
        const problemInfo = getProblemInfo(problemName, statusMap[problemName])
        const isSelected = selectedProblem === problemName
        
        return (
          <ProblemItem
            key={problemName}
            problemName={problemName}
            problemInfo={problemInfo}
            isSelected={isSelected}
            onClick={() => handleProblemSelect(problemName)}
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
  problemName,
  problemInfo,
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

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <li 
      key={problemName}
      className={`problem-item ${isSelected ? 'selected' : ''}`}
    >
      <div onClick={handleClick} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`status-dot ${problemInfo.status}`}></span>
          <span>{problemName}</span>
        </div>
        {showRoundIndicator && (
          <span className="small-font">Round {problemInfo.currentRound}</span>
        )}
      </div>
    </li>
  )
}