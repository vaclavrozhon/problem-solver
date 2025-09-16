/**
 * Type definitions for the Problem Solving Interface
 * 
 * This file contains all TypeScript interfaces and types used across the solving components.
 * It serves as the single source of truth for data structures in the problem-solving workflow.
 */

// =============================================================================
// CORE DATA STRUCTURES
// =============================================================================

/**
 * Represents a single research round's conversation data
 * Contains the back-and-forth between provers, verifier, and summarizer
 */
export interface RoundData {
  /** Round identifier (e.g., "round-0001") */
  name: string
  
  /** Verifier's verdict on the round's progress */
  verdict?: 'success' | 'partial success' | 'promising' | 'uncertain' | 'unlikely' | 'nothing so far'
  
  /** Performance timings for each agent in seconds */
  timings?: Record<string, { duration_s: number }>
  
  /** Array of prover outputs (can be multiple provers per round) */
  provers: Array<{ 
    name: string      // e.g., "prover-01", "prover-02"
    content: string   // The prover's research output
  }>
  
  /** Verifier's feedback on the prover outputs */
  verifier: string
  
  /** Summarizer's digest of the round */
  summary: string
  
  /** One-line summary from summarizer for UI display */
  one_line_summary?: string
  
  /** Round number for sorting and identification */
  number?: number
  
  /** Round completion status */
  status?: 'completed' | 'in_progress'
}

/**
 * Real-time status information for a research problem
 * Received from the backend's live status API
 */
export interface ProblemStatus {
  /** Overall status information */
  overall: {
    /** Current execution phase */
    phase: 'idle' | 'prover' | 'verifier' | 'summarizer'
    
    /** Current round number (0 means no rounds started) */
    current_round: number
    
    /** Whether the problem is actively running */
    is_running: boolean
    
    /** Whether the last round was completed successfully */
    last_round_completed: boolean
    
    /** Number of remaining rounds to execute */
    remaining_rounds: number
    
    /** Unix timestamp of last status update */
    timestamp: number
    
    /** Error message if the run failed */
    error?: string
    
    /** Component that failed (prover, verifier, summarizer) */
    error_component?: string
    
    /** Phase where the error occurred (execution, parallel_execution, etc.) */
    error_phase?: string
    
    /** Current round within the current batch (1-based) */
    current_batch_round?: number
    
    /** Total number of rounds in the current batch */
    batch_size?: number
    
    /** Starting round number of the current batch */
    batch_start_round?: number
  }
  
  /** Per-round status details */
  rounds: Array<{
    name: string
    number: number
    status: 'completed' | 'in_progress'
    verdict?: string
    models?: Record<string, string>
    timings?: Record<string, any>
    completed_at?: number
    one_line_summary?: string
  }>
  
  /** AI models being used for this problem */
  models: {
    prover?: string
    verifier?: string  
    summarizer?: string
    paper_suggester?: string
    paper_fixer?: string
  }
}

/**
 * Simplified problem information for display in lists
 * Derived from ProblemStatus for UI convenience
 */
export interface ProblemInfo {
  /** Problem name/identifier */
  name: string
  
  /** Current execution status */
  status: 'running' | 'stopped' | 'error'
  
  /** Current round number */
  currentRound: number
  
  /** Total rounds planned or completed */
  totalRounds: number
  
  /** Last verifier verdict if available */
  lastVerdict?: string
}

// =============================================================================
// COMPONENT PROP INTERFACES
// =============================================================================

/**
 * Props for components that need basic problem identification
 */
export interface ProblemComponentProps {
  /** The selected problem name */
  problemName: string
}

/**
 * Props for components that handle problem selection
 */
export interface ProblemSelectorProps extends ProblemComponentProps {
  /** List of all available problems */
  problems: string[]
  
  /** Currently selected problem (null if none selected) */
  selected: string | null
  
  /** Callback when user selects a different problem */
  onSelectProblem: (problemName: string) => void
  
  /** Function to get display info for a problem */
  getProblemInfo: (problemName: string) => ProblemInfo
}

/**
 * Props for components that display status information
 */
export interface StatusDisplayProps extends ProblemComponentProps {
  /** Current problem status data */
  status?: ProblemStatus
  
  /** Whether data is currently loading */
  loading?: boolean
}

/**
 * Props for components that need message display capability
 */
export interface MessageHandlerProps {
  /** Current message to display */
  message: AppMessage | null
  
  /** Callback to set/clear messages */
  setMessage: (message: AppMessage | null) => void
}

/**
 * Standard message format for user feedback
 */
export interface AppMessage {
  type: 'success' | 'error' | 'info'
  text: string
}

// =============================================================================
// FORM AND CONTROL INTERFACES  
// =============================================================================

/**
 * Parameters for starting a research run
 */
export interface ProverConfig {
  /** Whether this prover has access to calculator */
  calculator: boolean
  
  /** Focus instruction type */
  focus: string
  
  /** Paper access permissions - maps paper path to boolean */
  paperAccess?: Record<string, boolean>
}

export interface VerifierConfig {
  /** Whether the verifier has access to calculator */
  calculator: boolean
  
  /** Focus instruction type */
  focus: string
  
  /** Paper access permissions - maps paper path to boolean */
  paperAccess?: Record<string, boolean>
}

export interface RunParameters {
  /** Number of research rounds to execute */
  rounds: number
  
  /** Number of parallel provers per round */
  provers: number
  
  /** AI model preset to use */
  preset: 'gpt5' | 'fast'
  
  /** Temperature for AI models (if supported) */
  temperature?: number
  
  /** Per-prover configurations */
  proverConfigs?: ProverConfig[]
  
  /** Verifier configuration */
  verifierConfig?: VerifierConfig
  
  /** Focus description for this research round */
  focusDescription?: string
}

/**
 * Available AI model presets
 */
export interface ModelPreset {
  label: string    // Display name
  value: string    // Internal identifier
}

/**
 * File information for the file browser
 */
export interface FileInfo {
  /** Display name */
  name: string
  
  /** File path relative to problem directory */
  path: string
  
  /** File type for icon/handling purposes */
  type: 'markdown' | 'text' | 'paper' | 'pdf'
  
  /** File size in bytes */
  size: number
  
  /** Last modified timestamp string */
  modified: string
  
  /** Optional description for papers */
  description?: string
}

/**
 * File version information for versioned files
 */
export interface FileVersion {
  /** Version identifier (e.g., "current", "round-0001") */
  version: string
  
  /** Human-readable version label (e.g., "Current", "Round 1") */
  label: string
  
  /** Last modified timestamp string */
  modified: string
}

// =============================================================================
// STATE MANAGEMENT TYPES
// =============================================================================

/**
 * Main application state for the solving interface
 * This documents all state variables used across components
 */
export interface SolvingState {
  // Problem Management
  /** List of all available problems */
  problems: string[]
  
  /** Currently selected problem name */
  selected: string | null
  
  /** Real-time status data for all problems */
  statusMap: Record<string, ProblemStatus>
  
  // UI State  
  /** Currently displayed message to user */
  message: AppMessage | null
  
  /** Whether any async operation is in progress */
  loading: boolean
  
  /** Whether auto-refresh is enabled (always true for now) */
  autoRefresh: boolean
  
  // Modal State
  /** Whether the delete rounds modal is open */
  showDeleteModal: boolean
  
  /** Number of rounds to delete when confirmed */
  deleteRoundsCount: number
  
  /** Whether the delete problem modal is open */ 
  showDeleteProblemModal: boolean
  
  /** Problem name queued for deletion */
  problemToDelete: string | null
  
  // Run Configuration (persisted per session)
  /** Number of rounds for new runs */
  rounds: number
  
  /** Number of provers for new runs */
  provers: number
  
  /** AI model preset for new runs */
  preset: string
  
  /** Temperature setting (legacy - not used for GPT-5) */
  temperature: number
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Tab identifiers for the problem details view
 */
export type ProblemTab = 'status' | 'conversations' | 'files'

/**
 * Problem execution phases
 */
export type ExecutionPhase = 'idle' | 'prover' | 'verifier' | 'summarizer'

/**
 * Research verdicts that can be returned by the verifier
 */
export type ResearchVerdict = 'success' | 'partial success' | 'promising' | 'uncertain' | 'unlikely' | 'nothing so far'