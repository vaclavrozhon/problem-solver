/**
 * Utility Functions for Problem Solving Interface
 * 
 * This file contains pure helper functions used across the solving components.
 * Functions here should be stateless and focused on data transformation and calculations.
 * 
 * Key principles:
 * - All functions are pure (no side effects)  
 * - Clear input/output contracts
 * - Well documented with examples
 * - Handle edge cases gracefully
 */

import { ProblemStatus, ProblemInfo, RoundData, ResearchVerdict } from './types'

// =============================================================================
// STATUS CALCULATION UTILITIES
// =============================================================================

/**
 * Converts raw backend ProblemStatus into simplified ProblemInfo for display
 * 
 * This is the main utility for deriving UI-friendly status information from
 * the complex backend status object.
 * 
 * @param problem - Problem name/identifier
 * @param status - Raw status data from backend (optional)
 * @returns Simplified ProblemInfo for UI display
 * 
 * @example
 * const info = getProblemInfo('my-problem', backendStatus)
 * // Returns: { name: 'my-problem', status: 'running', currentRound: 3, ... }
 */
export function getProblemInfo(problem: string, status?: ProblemStatus): ProblemInfo {
  // Default fallback when no status available
  if (!status) {
    return {
      name: problem,
      status: 'stopped',
      currentRound: 0,
      totalRounds: 0
    }
  }

  // Determine execution status based on phase and running state
  let executionStatus: 'running' | 'stopped' | 'error' = 'stopped'
  
  if (status.overall.error) {
    executionStatus = 'error'
  } else if (status.overall.is_running && status.overall.phase !== 'idle') {
    executionStatus = 'running'
  }

  // Use batch-aware values if available, otherwise fall back to legacy calculation
  const currentBatchRound = status.overall.current_batch_round || status.overall.current_round
  const batchSize = status.overall.batch_size || (status.overall.current_round + (status.overall.remaining_rounds || 0))
  
  // Extract last verdict from the most recent round
  let lastVerdict: string | undefined
  if (status.rounds && status.rounds.length > 0) {
    const lastRound = status.rounds.reduce((latest, current) => 
      current.number > latest.number ? current : latest
    )
    lastVerdict = lastRound.verdict
  }

  return {
    name: problem,
    status: executionStatus,
    currentRound: currentBatchRound,
    totalRounds: batchSize,
    lastVerdict: lastVerdict
  }
}

/**
 * Determines if a problem is currently executing
 * 
 * @param status - Problem status object
 * @returns True if problem is actively running
 */
export function isProblemRunning(status?: ProblemStatus): boolean {
  return Boolean(
    status?.overall.is_running && 
    status?.overall.phase !== 'idle'
  )
}

/**
 * Gets a human-readable status description
 * 
 * @param info - Problem info object
 * @param status - Optional status object for batch context
 * @returns Status description for display
 */
export function getStatusDescription(info: ProblemInfo, status?: ProblemStatus): string {
  switch (info.status) {
    case 'running':
      // Show batch context if available, otherwise use current round
      if (status?.overall.current_batch_round && status?.overall.batch_size) {
        return `Running (Round ${status.overall.current_batch_round} of batch of ${status.overall.batch_size} rounds)`
      } else if (status?.overall.current_round) {
        return `Running (Round ${status.overall.current_round})`
      }
      return `Running (Round ?)`
    case 'error':
      return 'Error'
    case 'stopped':
      return info.currentRound > 0 ? 'Complete' : 'Not started'
    default:
      return 'Unknown'
  }
}

// =============================================================================
// TIME AND FORMATTING UTILITIES
// =============================================================================

/**
 * Formats duration from seconds to human-readable format
 * 
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 * 
 * @example
 * formatDuration(65) // "1m 5s"
 * formatDuration(3665) // "1h 1m 5s"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * Formats a timestamp to a relative time description
 * 
 * @param timestamp - Unix timestamp
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = now - timestamp

  if (diff < 60) {
    return 'just now'
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ago`
  } else {
    return `${Math.floor(diff / 86400)}d ago`
  }
}

// =============================================================================
// VERDICT AND PROGRESS UTILITIES
// =============================================================================

/**
 * Maps research verdicts to display properties
 * 
 * @param verdict - The verifier's verdict
 * @returns Display properties (emoji, color, description)
 */
export function getVerdictDisplayInfo(verdict?: ResearchVerdict) {
  const verdictMap = {
    'success': { emoji: '🎉', color: '#28a745', description: 'Major breakthrough' },
    'promising': { emoji: '✅', color: '#28a745', description: 'Significant progress' },
    'partial success': { emoji: '🔶', color: '#ffc107', description: 'Some progress made' },
    'uncertain': { emoji: '⚠️', color: '#856404', description: 'Unclear direction' },
    'unlikely': { emoji: '❌', color: '#dc3545', description: 'Approach unlikely' },
    'nothing so far': { emoji: '⭕', color: '#6c757d', description: 'No progress yet' }
  }

  return verdict ? verdictMap[verdict] || { emoji: '—', color: '#6c757d', description: 'Unknown' }
                 : { emoji: '—', color: '#6c757d', description: 'No verdict' }
}

/**
 * Calculates overall progress percentage for a problem based on completed rounds
 * 
 * @param info - Problem info object
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(info: ProblemInfo): number {
  if (info.totalRounds === 0) return 0
  
  // If we're running, show progress based on completed rounds (currentRound - 1)
  // If we're stopped/idle, show progress based on all completed rounds
  const completedRounds = info.status === 'running' 
    ? Math.max(0, info.currentRound - 1)  // During execution: k-1 out of k rounds
    : Math.min(info.currentRound, info.totalRounds)  // After completion: all completed rounds
    
  return Math.floor((completedRounds / info.totalRounds) * 100)
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validates run parameters before submission
 * 
 * @param rounds - Number of rounds
 * @param provers - Number of provers  
 * @param preset - Model preset
 * @returns Validation result with error message if invalid
 */
export function validateRunParameters(
  rounds: number, 
  provers: number, 
  preset: string
): { valid: boolean; error?: string } {
  if (rounds < 1 || rounds > 100) {
    return { valid: false, error: 'Rounds must be between 1 and 100' }
  }
  
  if (provers < 1 || provers > 10) {
    return { valid: false, error: 'Provers must be between 1 and 10' }
  }
  
  if (!['gpt5', 'fast'].includes(preset)) {
    return { valid: false, error: 'Invalid model preset' }
  }

  return { valid: true }
}

/**
 * Checks if a problem name is valid
 * 
 * @param name - Problem name to validate
 * @returns True if name is valid
 */
export function isValidProblemName(name: string): boolean {
  return Boolean(
    name &&
    name.length > 0 &&
    name.length <= 100 &&
    /^[a-zA-Z0-9_-]+$/.test(name)
  )
}

// =============================================================================
// DATA TRANSFORMATION UTILITIES
// =============================================================================

/**
 * Sorts rounds by round number in descending order (newest first)
 * 
 * @param rounds - Array of round data
 * @returns Sorted array (does not mutate original)
 */
export function sortRoundsDescending(rounds: RoundData[]): RoundData[] {
  return [...rounds].sort((a, b) => {
    const aNum = a.number ?? parseInt(a.name.split('-')[1] || '0')
    const bNum = b.number ?? parseInt(b.name.split('-')[1] || '0')
    return bNum - aNum
  })
}

/**
 * Extracts round number from round name
 * 
 * @param roundName - Round name (e.g., "round-0001")
 * @returns Round number or 0 if parsing fails
 */
export function extractRoundNumber(roundName: string): number {
  const match = roundName.match(/round-(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

/**
 * Groups timing data by agent type for display
 * 
 * @param timings - Raw timing data from round
 * @returns Organized timing data
 */
export function organizeTimings(timings: Record<string, { duration_s: number }>): {
  provers: Array<{ name: string; duration: number }>
  verifier?: number
  summarizer?: number
} {
  const organized = {
    provers: [] as Array<{ name: string; duration: number }>
  }

  for (const [agent, timing] of Object.entries(timings)) {
    const duration = Math.ceil(timing.duration_s) // Round up to integer seconds
    
    if (agent.startsWith('prover')) {
      organized.provers.push({ name: agent, duration })
    } else if (agent === 'verifier') {
      organized.verifier = duration
    } else if (agent === 'summarizer') {
      organized.summarizer = duration
    }
  }

  // Sort provers by name for consistent display
  organized.provers.sort((a, b) => a.name.localeCompare(b.name))

  return organized
}

// =============================================================================
// UI STATE UTILITIES
// =============================================================================

/**
 * Determines the appropriate CSS class for a status indicator
 * 
 * @param status - Problem execution status
 * @returns CSS class name
 */
export function getStatusClassName(status: 'running' | 'stopped' | 'error'): string {
  switch (status) {
    case 'running':
      return 'status-running'
    case 'error':
      return 'status-error'
    case 'stopped':
    default:
      return 'status-stopped'
  }
}

/**
 * Creates a debounced version of a function
 * Useful for API calls that shouldn't fire too frequently
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * Gets the appropriate color for a verifier verdict indicator
 * 
 * @param verdict - The verifier verdict
 * @returns Color string for the indicator dot
 */
export function getVerdictColor(verdict?: string): string {
  switch (verdict) {
    case 'success':
    case 'promising':
      return '#28a745' // Green
    case 'partial success':
    case 'uncertain':
      return '#ffc107' // Yellow/Orange
    case 'unlikely':
    case 'nothing so far':
      return '#dc3545' // Red
    default:
      return '#6c757d' // Grey (no verdict/backward compatibility)
  }
}