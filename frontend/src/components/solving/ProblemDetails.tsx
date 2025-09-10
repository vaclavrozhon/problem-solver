/**
 * ProblemDetails Component
 * 
 * Main content area that displays detailed information about a selected problem.
 * This component coordinates between different views (Status, Conversations, Files)
 * using a tabbed interface and manages the overall problem interaction state.
 * 
 * Features:
 * - Tabbed interface for different problem views
 * - Status panel integration with run controls
 * - Conversations panel for round history
 * - Files panel for document management
 * - Shared state management between tabs
 * - Message handling and user feedback
 * - Loading states and error handling
 * - Empty state when no problem selected
 */

import React, { useState, useEffect } from 'react'
import StatusPanel from './StatusPanel'
import ConversationsPanel from './ConversationsPanel'
import FilesPanel from './FilesPanel'
import { 
  ProblemStatus, 
  AppMessage,
  StatusDisplayProps,
  MessageHandlerProps
} from './types'

// =============================================================================
// INTERFACES
// =============================================================================

interface ProblemDetailsProps extends StatusDisplayProps, MessageHandlerProps {
  /** Whether any async operation is in progress */
  loading: boolean
  
  /** Callback when user starts a run */
  onRunStart: () => void
  
  /** Callback when user stops a problem */
  onStop: () => void
  
  /** Callback to trigger delete rounds modal */
  onDeleteRounds: () => void
  
  /** Callback to trigger delete problem modal */
  onDeleteProblem: () => void
  
  /** Callback to trigger reset problem modal */
  onResetProblem: () => void
}

// Tab configuration
interface TabConfig {
  id: string
  label: string
  icon: string
  description: string
}

const TABS: TabConfig[] = [
  {
    id: 'status',
    label: 'Status',
    icon: '📊',
    description: 'Problem status and run controls'
  },
  {
    id: 'conversations',
    label: 'Conversations',
    icon: '💬',
    description: 'AI research conversations by round'
  },
  {
    id: 'files',
    label: 'Files',
    icon: '📁',
    description: 'Problem files and documents'
  }
]

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProblemDetails({
  problemName,
  status,
  loading,
  message,
  setMessage,
  onRunStart,
  onStop,
  onDeleteRounds,
  onDeleteProblem,
  onResetProblem
}: ProblemDetailsProps) {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  /** Currently active tab */
  const [activeTab, setActiveTab] = useState<string>('status')
  
  /** Track which tab was last active for each problem (persistence) */
  const [tabHistory, setTabHistory] = useState<Record<string, string>>({})

  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  /** Restore tab state when problem changes */
  useEffect(() => {
    if (problemName) {
      const lastActiveTab = tabHistory[problemName] || 'status'
      setActiveTab(lastActiveTab)
    }
  }, [problemName]) // Only depend on problemName, not tabHistory
  
  /** Save tab state when tab changes */
  useEffect(() => {
    if (problemName && activeTab) {
      setTabHistory(prev => ({
        ...prev,
        [problemName]: activeTab
      }))
    }
  }, [problemName, activeTab])

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  /**
   * Handles tab change with validation
   */
  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId)
    }
  }

  /**
   * Handles file selection from files tab
   */
  const handleFileSelect = (fileName: string) => {
    // Could be used for cross-tab coordination in the future
    console.log(`File selected: ${fileName}`)
  }

  /**
   * Handles round selection from conversations tab
   */
  const handleRoundSelect = (roundName: string) => {
    // Could be used for cross-tab coordination in the future
    console.log(`Round selected: ${roundName}`)
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Renders the empty state when no problem is selected
   */
  const renderEmptyState = () => (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
      color: '#6c757d',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔬</div>
      <h3 style={{ margin: '0 0 8px 0', color: '#495057' }}>
        No Problem Selected
      </h3>
      <p style={{ margin: 0, fontSize: '16px', maxWidth: '400px' }}>
        Choose a problem from the sidebar to view its status, conversations, and files
      </p>
    </div>
  )

  /**
   * Renders the problem header
   */
  const renderProblemHeader = () => (
    <div style={{ 
      borderBottom: '1px solid #dee2e6',
      paddingBottom: '16px',
      marginBottom: '20px'
    }}>
      <h2 style={{ 
        margin: '0 0 8px 0',
        color: '#333',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        {problemName}
      </h2>
      
      <div style={{ 
        fontSize: '14px',
        color: '#666'
      }}>
        Research problem analysis and management
      </div>
    </div>
  )

  /**
   * Renders the tab navigation
   */
  const renderTabNavigation = () => (
    <div 
      className="tab-navigation"
      style={{
        display: 'flex',
        borderBottom: '2px solid #e9ecef',
        marginBottom: '20px'
      }}
    >
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => handleTabChange(tab.id)}
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 20px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
            color: activeTab === tab.id ? '#007bff' : '#6c757d',
            borderBottom: activeTab === tab.id ? '2px solid #007bff' : '2px solid transparent',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: loading ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading && activeTab !== tab.id) {
              e.currentTarget.style.color = '#495057'
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.color = '#6c757d'
            }
          }}
          title={tab.description}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )

  /**
   * Renders the active tab content
   */
  const renderTabContent = () => {
    if (!problemName) return null

    switch (activeTab) {
      case 'status':
        return (
          <StatusPanel
            problemName={problemName}
            status={status}
            loading={loading}
            message={message}
            setMessage={setMessage}
            onRunStart={onRunStart}
            onStop={onStop}
            onDeleteRounds={onDeleteRounds}
            onDeleteProblem={onDeleteProblem}
            onResetProblem={onResetProblem}
          />
        )
      
      case 'conversations':
        return (
          <ConversationsPanel
            problemName={problemName}
            onRoundSelect={handleRoundSelect}
          />
        )
      
      case 'files':
        return (
          <FilesPanel
            problemName={problemName}
            onFileSelect={handleFileSelect}
          />
        )
      
      default:
        return (
          <div style={{ 
            padding: '40px',
            textAlign: 'center',
            color: '#dc3545'
          }}>
            Unknown tab: {activeTab}
          </div>
        )
    }
  }

  /**
   * Renders global messages
   */
  const renderMessages = () => {
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
            '#0c5460'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>
            {message.type === 'error' ? '❌' :
             message.type === 'success' ? '✅' :
             message.type === 'warning' ? '⚠️' :
             'ℹ️'}
          </span>
          <span>{message.text}</span>
          
          {/* Close button */}
          <button
            onClick={() => setMessage(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0 4px'
            }}
            title="Dismiss message"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div 
      className="problem-details"
      style={{
        flex: 1,
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Show empty state if no problem selected */}
      {!problemName ? renderEmptyState() : (
        <div style={{ 
          padding: '20px',
          height: '100%',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Problem header */}
          {renderProblemHeader()}
          
          {/* Global messages */}
          {renderMessages()}
          
          {/* Tab navigation */}
          {renderTabNavigation()}
          
          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  )
}