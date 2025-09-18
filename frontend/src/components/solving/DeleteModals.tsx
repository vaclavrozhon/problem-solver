/**
 * DeleteModals Component
 * 
 * Provides confirmation modals for destructive operations in the problem-solving
 * interface. This component centralizes all delete-related UI and ensures
 * consistent styling and behavior across different deletion types.
 * 
 * Features:
 * - Delete Problem Modal: Remove entire problem with all associated data
 * - Reset Problem Modal: Clear all interactions while keeping the task
 * - Clear warning messages and confirmation flow
 * - Keyboard support (Enter/Escape)
 * - Loading states during deletion
 * - Error handling and user feedback
 * - Backdrop click to cancel (optional)
 */

import React, { useEffect } from 'react'

// =============================================================================
// INTERFACES
// =============================================================================

interface DeleteModalsProps {
  /** Whether the delete problem modal is visible */
  showDeleteProblemModal: boolean

  /** Whether the reset problem modal is visible */
  showResetProblemModal: boolean

  /** Problem name to delete (for problem modal) */
  problemToDelete: string | null

  /** Problem name to reset (for reset modal) */
  problemToReset: string | null

  /** Loading state during delete operations */
  loading: boolean
  
  /** Callback to close delete problem modal */
  onCloseDeleteProblemModal: () => void

  /** Callback to close reset problem modal */
  onCloseResetProblemModal: () => void

  /** Callback to execute problem deletion */
  onDeleteProblem: () => void

  /** Callback to execute problem reset */
  onResetProblem: () => void
}

// Modal base styles for consistency
const MODAL_BACKDROP_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
}

const MODAL_CONTENT_STYLE: React.CSSProperties = {
  background: 'white',
  padding: '24px',
  borderRadius: '8px',
  minWidth: '400px',
  maxWidth: '500px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  animation: 'modalFadeIn 0.2s ease-out'
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function DeleteModals({
  showDeleteProblemModal,
  showResetProblemModal,
  problemToDelete,
  problemToReset,
  loading,
  onCloseDeleteProblemModal,
  onCloseResetProblemModal,
  onDeleteProblem,
  onResetProblem
}: DeleteModalsProps) {
  
  // =============================================================================
  // KEYBOARD HANDLERS
  // =============================================================================
  
  /** Handle keyboard shortcuts (Enter/Escape) */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteProblemModal) {
          onCloseDeleteProblemModal()
        }
        if (showResetProblemModal) {
          onCloseResetProblemModal()
        }
      }

      if (e.key === 'Enter' && !loading) {
        if (showDeleteProblemModal) {
          onDeleteProblem()
        }
        if (showResetProblemModal) {
          onResetProblem()
        }
      }
    }

    if (showDeleteProblemModal || showResetProblemModal) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
      }
    }
  }, [
    showDeleteProblemModal,
    showResetProblemModal,
    loading,
    onCloseDeleteProblemModal,
    onCloseResetProblemModal,
    onDeleteProblem,
    onResetProblem
  ])

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  /**
   * Handles backdrop click to close modal
   */
  const handleBackdropClick = (e: React.MouseEvent, closeModal: () => void) => {
    if (e.target === e.currentTarget && !loading) {
      closeModal()
    }
  }


  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Renders the delete rounds modal
   */
  const renderDeleteRoundsModal = () => {
    if (!showDeleteRoundsModal) return null

    return (
      <div 
        style={MODAL_BACKDROP_STYLE}
        onClick={(e) => handleBackdropClick(e, onCloseDeleteRoundsModal)}
      >
        <div style={MODAL_CONTENT_STYLE}>
          <h3 style={{ 
            margin: '0 0 16px 0',
            color: '#dc3545',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🗑️ Delete Past Conversations
          </h3>
          
          <p style={{ margin: '0 0 16px 0', lineHeight: '1.5' }}>
            This will permanently delete the oldest conversation rounds for this problem.
            This action cannot be undone.
          </p>
          
          {/* Rounds count input */}
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="rounds-count"
              style={{ 
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#495057'
              }}
            >
              Number of rounds to delete:
            </label>
            <input
              id="rounds-count"
              type="number"
              min={1}
              max={100}
              value={deleteRoundsCount}
              onChange={handleRoundsCountChange}
              disabled={loading}
              style={{
                width: '100px',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <div style={{ 
              fontSize: '12px',
              color: '#6c757d',
              marginTop: '4px'
            }}>
              Oldest rounds will be deleted first
            </div>
          </div>

          {/* Warning message */}
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              color: '#856404',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <div>
                <strong>Warning:</strong> This will permanently delete {deleteRoundsCount} conversation round{deleteRoundsCount !== 1 ? 's' : ''} 
                including all prover outputs, verifier feedback, and summaries.
                <br /><br />
                <strong>Note:</strong> You cannot delete all rounds from a problem. At least one round must remain.
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end'
          }}>
            <button
              className="btn btn-secondary"
              onClick={onCloseDeleteRoundsModal}
              disabled={loading}
              style={{ minWidth: '80px' }}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={onDeleteRounds}
              disabled={loading}
              style={{ 
                minWidth: '120px',
                position: 'relative'
              }}
            >
              {loading ? (
                <>
                  <span style={{ opacity: 0.7 }}>Deleting...</span>
                  <span style={{ 
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}>
                    ⏳
                  </span>
                </>
              ) : (
                <>🗑️ Delete {deleteRoundsCount} Round{deleteRoundsCount !== 1 ? 's' : ''}</>
              )}
            </button>
          </div>

          {/* Keyboard hints */}
          <div style={{
            marginTop: '16px',
            fontSize: '11px',
            color: '#6c757d',
            textAlign: 'center'
          }}>
            Press <kbd>Enter</kbd> to delete or <kbd>Escape</kbd> to cancel
          </div>
        </div>
      </div>
    )
  }

  /**
   * Renders the delete problem modal
   */
  const renderDeleteProblemModal = () => {
    if (!showDeleteProblemModal) return null

    return (
      <div 
        style={MODAL_BACKDROP_STYLE}
        onClick={(e) => handleBackdropClick(e, onCloseDeleteProblemModal)}
      >
        <div style={MODAL_CONTENT_STYLE}>
          <h3 style={{ 
            margin: '0 0 16px 0',
            color: '#dc3545',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚠️ Delete Problem
          </h3>
          
          <p style={{ margin: '0 0 16px 0', lineHeight: '1.5' }}>
            Are you sure you want to delete the problem{' '}
            <strong style={{ color: '#dc3545' }}>"{problemToDelete}"</strong>?
          </p>

          {/* Critical warning */}
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              color: '#721c24',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>💥</span>
                <strong>This action is irreversible!</strong>
              </div>
              
              <div style={{ marginLeft: '24px' }}>
                This will permanently delete:
                <ul style={{ 
                  margin: '8px 0 0 0',
                  paddingLeft: '16px'
                }}>
                  <li>All conversation rounds and AI outputs</li>
                  <li>Research notes and progress files</li>
                  <li>Problem configuration and metadata</li>
                  <li>Any generated papers or documents</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation input (future enhancement) */}
          {/* Could add "type problem name to confirm" input here */}

          {/* Action buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end'
          }}>
            <button
              className="btn btn-secondary"
              onClick={onCloseDeleteProblemModal}
              disabled={loading}
              style={{ minWidth: '80px' }}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={onDeleteProblem}
              disabled={loading}
              style={{ 
                minWidth: '140px',
                position: 'relative',
                backgroundColor: '#dc3545',
                borderColor: '#dc3545'
              }}
            >
              {loading ? (
                <>
                  <span style={{ opacity: 0.7 }}>Deleting...</span>
                  <span style={{ 
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}>
                    ⏳
                  </span>
                </>
              ) : (
                <>🗑️ Delete Problem</>
              )}
            </button>
          </div>

          {/* Keyboard hints */}
          <div style={{
            marginTop: '16px',
            fontSize: '11px',
            color: '#6c757d',
            textAlign: 'center'
          }}>
            Press <kbd>Enter</kbd> to delete or <kbd>Escape</kbd> to cancel
          </div>
        </div>
      </div>
    )
  }

  /**
   * Renders the reset problem modal
   */
  const renderResetProblemModal = () => {
    if (!showResetProblemModal) return null

    return (
      <div 
        style={MODAL_BACKDROP_STYLE}
        onClick={(e) => handleBackdropClick(e, onCloseResetProblemModal)}
      >
        <div style={MODAL_CONTENT_STYLE}>
          <h3 style={{ 
            margin: '0 0 16px 0',
            color: '#fd7e14',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔄 Reset Problem
          </h3>
          
          <p style={{ margin: '0 0 16px 0', lineHeight: '1.5' }}>
            Are you sure you want to reset the problem{' '}
            <strong style={{ color: '#fd7e14' }}>"{problemToReset}"</strong>?
          </p>

          <p style={{ margin: '0 0 16px 0', lineHeight: '1.5', color: '#6c757d' }}>
            This will keep the task description but remove all prover/verifier interactions and conversations.
          </p>

          {/* Warning message */}
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              color: '#856404',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <strong>This will permanently remove:</strong>
              </div>
              
              <div style={{ marginLeft: '24px' }}>
                <ul style={{ 
                  margin: '8px 0 0 0',
                  paddingLeft: '16px'
                }}>
                  <li>All conversation rounds and AI outputs</li>
                  <li>Research progress and summaries</li>
                  <li>Generated notes and intermediate results</li>
                </ul>
                <div style={{ marginTop: '8px' }}>
                  <strong>The task description and reference papers will be preserved.</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end'
          }}>
            <button
              className="btn btn-secondary"
              onClick={onCloseResetProblemModal}
              disabled={loading}
              style={{ minWidth: '80px' }}
            >
              Cancel
            </button>
            <button
              className="btn btn-warning"
              onClick={onResetProblem}
              disabled={loading}
              style={{ 
                minWidth: '120px',
                position: 'relative',
                backgroundColor: '#fd7e14',
                borderColor: '#fd7e14'
              }}
            >
              {loading ? (
                <>
                  <span style={{ opacity: 0.7 }}>Resetting...</span>
                  <span style={{ 
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}>
                    ⏳
                  </span>
                </>
              ) : (
                <>🔄 Reset Problem</>
              )}
            </button>
          </div>

          {/* Keyboard hints */}
          <div style={{
            marginTop: '16px',
            fontSize: '11px',
            color: '#6c757d',
            textAlign: 'center'
          }}>
            Press <kbd>Enter</kbd> to reset or <kbd>Escape</kbd> to cancel
          </div>
        </div>
      </div>
    )
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <>
      {renderDeleteProblemModal()}
      {renderResetProblemModal()}
      
      {/* Add modal animation CSS if not already present */}
      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        kbd {
          background: #f8f9fa;
          border: 1px solid #ced4da;
          border-radius: 3px;
          padding: 1px 4px;
          font-size: 10px;
          font-family: monospace;
        }
      `}</style>
    </>
  )
}