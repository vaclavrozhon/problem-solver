/**
 * ConversationsPanel Component
 * 
 * Displays research conversations showing prover-verifier-summarizer interactions
 * for all rounds of a research problem. This component provides a comprehensive
 * view of the AI research process with detailed conversation history.
 * 
 * Features:
 * - Round-by-round conversation display
 * - Multiple prover selection for rounds with multiple provers
 * - Verdict display with emoji indicators
 * - Timing information for performance analysis
 * - Three-column layout for clear conversation flow
 * - Reverse chronological order (newest rounds first)
 * - Loading states and error handling
 */

import React, { useState, useEffect } from 'react'
import { ProblemComponentProps, RoundData } from './types'
import { getRounds, getPromptForRound } from '../../api'
import { getVerdictDisplayInfo, organizeTimings, formatDuration } from './utils'

// =============================================================================
// INTERFACES
// =============================================================================

interface ConversationsPanelProps extends ProblemComponentProps {
  /** Optional callback when round is selected (for external coordination) */
  onRoundSelect?: (roundName: string) => void

  /** Optional callback when a round is deleted */
  onRoundDelete?: (roundName: string) => void
}

interface RoundDisplayProps {
  /** Round data to display */
  round: RoundData
  /** Problem name for fetching files */
  problemName: string

  /** Whether to show expanded details */
  expanded?: boolean

  /** Callback when round is clicked */
  onSelect?: (roundName: string) => void

  /** Whether this is the latest (newest) round */
  isLatest?: boolean

  /** Callback to delete this round */
  onDelete?: (roundName: string) => void
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ConversationsPanel({
  problemName,
  onRoundSelect,
  onRoundDelete
}: ConversationsPanelProps) {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  /** List of all rounds for this problem */
  const [rounds, setRounds] = useState<RoundData[]>([])
  
  /** Loading state for API calls */
  const [loading, setLoading] = useState(false)
  
  /** Error state for failed operations */
  const [error, setError] = useState<string | null>(null)

  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  /** Load rounds when component mounts or problem changes */
  useEffect(() => {
    if (problemName) {
      loadRounds()
    }
  }, [problemName])

  // =============================================================================
  // API FUNCTIONS
  // =============================================================================

  /**
   * Loads round conversation data from the backend
   */
  const loadRounds = async () => {
    if (!problemName) return
    
    try {
      setLoading(true)
      setError(null)
      const roundsData = await getRounds(problemName)
      setRounds(roundsData)
    } catch (err: any) {
      console.error('Error loading rounds:', err)
      setError(err.message || 'Failed to load conversations')
      setRounds([])
    } finally {
      setLoading(false)
    }
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Renders the empty state when no rounds exist
   */
  const renderEmptyState = () => (
    <div style={{ 
      textAlign: 'center', 
      color: '#666', 
      padding: '40px 20px',
      background: '#f8f9fa',
      borderRadius: '6px',
      border: '1px solid #e9ecef'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
      <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>No Conversations Yet</h4>
      <p style={{ margin: 0, fontSize: '14px' }}>
        Start a research run to see AI conversations appear here
      </p>
    </div>
  )

  /**
   * Renders the error state
   */
  const renderError = () => (
    <div style={{ 
      padding: '16px',
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
      borderRadius: '6px'
    }}>
      <strong>❌ Error Loading Conversations</strong>
      <div style={{ marginTop: '8px', fontSize: '14px' }}>
        {error}
      </div>
      <button 
        className="btn btn-sm btn-outline-danger"
        onClick={loadRounds}
        style={{ marginTop: '8px', fontSize: '12px' }}
      >
        🔄 Retry
      </button>
    </div>
  )

  /**
   * Renders the conversations header with statistics
   */
  const renderHeader = () => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <h4 style={{ margin: 0 }}>🧪 Research Conversations</h4>
        <span style={{ 
          background: '#e9ecef', 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '12px',
          color: '#6c757d'
        }}>
          {rounds.length} round{rounds.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div style={{ fontSize: '12px', color: '#666' }}>
        Prover ↔ Verifier ↔ Summarizer interactions (newest first)
      </div>
    </div>
  )

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className="conversations-panel">
      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div>⏳ Loading conversations...</div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && renderError()}

      {/* Content */}
      {!loading && !error && (
        <>
          {rounds.length === 0 ? renderEmptyState() : (
            <>
              {renderHeader()}
              
              {/* Round list in reverse chronological order */}
              <div>
                {rounds.slice().reverse().map((round, index) => (
                  <RoundDisplay
                    key={round.name}
                    round={round}
                    problemName={problemName}
                    onSelect={onRoundSelect}
                    isLatest={index === 0} // First item is the latest after reverse()
                    onDelete={onRoundDelete}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

// =============================================================================
// ROUND DISPLAY COMPONENT
// =============================================================================

/**
 * Individual round conversation display component
 * Shows the three-way conversation between prover(s), verifier, and summarizer
 */
function RoundDisplay({ round, problemName, expanded = false, onSelect, isLatest = false, onDelete }: RoundDisplayProps) {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  /** Currently selected prover index (for rounds with multiple provers) */
  const [selectedProverIndex, setSelectedProverIndex] = useState(0)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================
  
  /** Get verdict display properties */
  const verdictInfo = getVerdictDisplayInfo(round.verdict)
  
  /** Organize timing data for display */
  const timingInfo = round.timings ? organizeTimings(round.timings) : null
  
  /** Check if this round has multiple provers */
  const hasMultipleProvers = round.provers && round.provers.length > 1
  
  /** Get current prover content */
  const currentProver = round.provers?.[selectedProverIndex]

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  /** Download a prompt file for a given agent within this round (DB-only) */
  const downloadAgentPrompt = async (agentName: string) => {
    try {
      const parseRoundNumber = (): number => {
        if (typeof round.number === 'number') return round.number
        const m = /^round-(\d+)/i.exec(round.name)
        return m ? parseInt(m[1], 10) : 1
      }
      const roundNum = parseRoundNumber()
      const content: string = await getPromptForRound(problemName, roundNum, agentName)
      const blob = new Blob([content || ''], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${agentName}.prompt.txt`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Failed to download prompt:', e)
      alert('Failed to download prompt')
    }
  }

  /**
   * Handles clicking on the round header
   */
  const handleRoundClick = () => {
    if (onSelect) {
      onSelect(round.name)
    }
  }

  /**
   * Handles deleting this round
   */
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering round selection
    if (onDelete && confirm(`Delete ${round.name}? This action cannot be undone.`)) {
      onDelete(round.name)
    }
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Renders the round header with metadata
   */
  const renderRoundHeader = () => (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px',
        cursor: onSelect ? 'pointer' : 'default'
      }}
      onClick={handleRoundClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Round name */}
        <strong style={{ fontSize: '16px' }}>{round.name}</strong>
        
        {/* Round number badge */}
        {round.number !== undefined && (
          <span style={{
            background: '#6c757d',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            #{round.number}
          </span>
        )}
        
        {/* Status indicator */}
        {round.status && (
          <span style={{
            background: round.status === 'completed' ? '#d4edda' : '#fff3cd',
            color: round.status === 'completed' ? '#155724' : '#856404',
            padding: '2px 6px',
            borderRadius: '8px',
            fontSize: '11px'
          }}>
            {round.status === 'completed' ? '✅ Complete' : '⏳ In Progress'}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Verdict display */}
        {round.verdict && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <strong>Verdict:</strong>
            <span style={{ color: verdictInfo.color }}>
              {verdictInfo.emoji} {round.verdict}
            </span>
          </div>
        )}

        {/* Delete button for latest round */}
        {isLatest && onDelete && (
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleDeleteClick}
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Delete this round (latest only)"
          >
            🗑️ Delete
          </button>
        )}

      </div>
    </div>
  )

  /**
   * Renders the three-column conversation display
   */
  const renderConversationColumns = () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr 1fr', 
      gap: '12px'
    }}>
      {/* Prover Column */}
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '8px' 
        }}>
          <strong>🤖 Prover</strong>
          <button
            className="btn btn-link btn-sm"
            style={{ padding: 0, fontSize: '11px' }}
            onClick={() => {
              const agentName = currentProver?.name || 'prover-01'
              downloadAgentPrompt(agentName)
            }}
          >prompt</button>
          
          {/* Prover selector for multiple provers */}
          {hasMultipleProvers && (
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
        
        <div 
          className="conversation-content"
          style={{ 
            height: '300px',
            overflowY: 'auto',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '12px'
          }}
        >
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px', lineHeight: '1.4' }}>
            {currentProver?.content || 'No content available'}
          </div>
        </div>
      </div>

      {/* Verifier Column */}
      <div>
        <div style={{ marginBottom: '8px' }}>
          <strong>🔍 Verifier</strong>
          <button
            className="btn btn-link btn-sm"
            style={{ padding: 0, fontSize: '11px', marginLeft: '8px' }}
            onClick={() => downloadAgentPrompt('verifier')}
          >prompt</button>
        </div>
        
        <div 
          className="conversation-content"
          style={{ 
            height: '300px',
            overflowY: 'auto',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '12px'
          }}
        >
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px', lineHeight: '1.4' }}>
            {round.verifier || 'No verifier output available'}
          </div>
        </div>
      </div>

      {/* Summarizer Column */}
      <div>
        <div style={{ marginBottom: '8px' }}>
          <strong>📝 Summary</strong>
          <button
            className="btn btn-link btn-sm"
            style={{ padding: 0, fontSize: '11px', marginLeft: '8px' }}
            onClick={() => downloadAgentPrompt('summarizer')}
          >prompt</button>
        </div>
        
        <div 
          className="conversation-content"
          style={{ 
            height: '300px',
            overflowY: 'auto',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '12px'
          }}
        >
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px', lineHeight: '1.4' }}>
            {round.summary || 'No summary available'}
          </div>
        </div>
      </div>
    </div>
  )

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div 
      style={{ 
        marginBottom: '30px', 
        border: '1px solid #dee2e6', 
        borderRadius: '8px', 
        padding: '16px',
        background: 'white'
      }}
    >
      {renderRoundHeader()}
      {renderConversationColumns()}
    </div>
  )
}