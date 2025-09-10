/**
 * StatusPanel Component
 * 
 * Displays real-time status information for a selected problem and provides
 * controls for starting/stopping research runs. This is the main control
 * interface for managing research execution.
 * 
 * Features:
 * - Real-time status display with auto-refresh
 * - Run configuration (rounds, provers, model preset)
 * - Start/Stop/Delete controls
 * - Error handling and user feedback
 * - Validation of run parameters
 */

import React, { useState, useEffect } from 'react'
import { 
  ProblemStatus, 
  RunParameters, 
  ProverConfig,
  ModelPreset, 
  AppMessage,
  StatusDisplayProps,
  MessageHandlerProps
} from './types'
import { 
  getProblemInfo, 
  isProblemRunning,
  getVerdictDisplayInfo,
  calculateProgress,
  validateRunParameters,
  organizeTimings,
  formatRelativeTime
} from './utils'
import { getStatus, runRound, stopProblem } from '../../api'
import ProverConfigComponent from './ProverConfig'

// =============================================================================
// INTERFACES
// =============================================================================

interface StatusPanelProps extends StatusDisplayProps, MessageHandlerProps {
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

// Available model presets
const MODEL_PRESETS: Record<string, ModelPreset> = {
  gpt5: { label: 'GPT-5 (default)', value: 'gpt5' },
  fast: { label: 'GPT4 (test)', value: 'fast' }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function StatusPanel({
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
}: StatusPanelProps) {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  // Run configuration state (persisted across sessions)
  const [runConfig, setRunConfig] = useState<RunParameters>({
    rounds: 2,
    provers: 2,
    preset: 'gpt5',
    temperature: 0.4 // Legacy - not used for GPT-5
  })
  
  // Focus options for prover configuration
  const [focusOptions, setFocusOptions] = useState([
    { key: 'default', name: 'No special instructions' },
    { key: 'new_ideas', name: 'Focus on new ideas to attack the problem' },
    { key: 'continue_notes', name: 'Continue with the line of attack stated in notes' },
    { key: 'literature_ideas', name: 'Look at relevant literature and find ideas there' },
    { key: 'improve_writeup', name: 'Notice flaws in current writeup and improve it' }
  ])
  
  // Local component state
  const [localLoading, setLocalLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<number>(0)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================
  
  // Get simplified problem info for display
  const problemInfo = getProblemInfo(problemName, status)
  const isRunning = isProblemRunning(status)
  const canStart = !loading && !localLoading && !isRunning
  const canStop = !loading && !localLoading && isRunning

  // =============================================================================
  // HANDLERS
  // =============================================================================
  
  /**
   * Handles starting a new research run
   * Validates parameters and calls API
   */
  const handleStartRun = async () => {
    // Validate parameters first
    const validation = validateRunParameters(
      runConfig.rounds,
      runConfig.provers,
      runConfig.preset
    )
    
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error || 'Invalid parameters' })
      return
    }

    try {
      setLocalLoading(true)
      onRunStart() // Notify parent component

      // Prepare API parameters (exclude temperature for GPT-5)
      const temperature = runConfig.preset === 'gpt5' ? 1.0 : runConfig.temperature

      const result = await runRound(
        problemName, 
        runConfig.rounds, 
        runConfig.provers, 
        temperature, 
        runConfig.preset, 
        runConfig.proverConfigs
      )
      
      setMessage({
        type: 'success',
        text: `Started ${runConfig.rounds} round(s) with ${runConfig.provers} prover(s)`
      })

    } catch (error: any) {
      console.error('Failed to start run:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to start research run'
      })
    } finally {
      setLocalLoading(false)
    }
  }

  /**
   * Handles stopping the current research run
   */
  const handleStop = async () => {
    if (!canStop) return

    try {
      setLocalLoading(true)
      onStop() // Notify parent

      await stopProblem(problemName)
      
      setMessage({
        type: 'info', 
        text: `Stopped research for "${problemName}"`
      })

    } catch (error: any) {
      console.error('Failed to stop problem:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to stop research'
      })
    } finally {
      setLocalLoading(false)
    }
  }

  /**
   * Updates run configuration and validates in real-time
   */
  const updateRunConfig = (updates: Partial<RunParameters>) => {
    setRunConfig(prev => ({ ...prev, ...updates }))
  }
  
  /**
   * Initialize or adjust prover configurations when number of provers changes
   */
  const ensureProverConfigs = (numProvers: number): ProverConfig[] => {
    const current = runConfig.proverConfigs || []
    const configs: ProverConfig[] = []
    
    for (let i = 0; i < numProvers; i++) {
      configs.push(current[i] || { calculator: false, focus: 'default' })
    }
    
    return configs
  }
  
  /**
   * Update configuration for a specific prover
   */
  const updateProverConfig = (proverIndex: number, config: ProverConfig) => {
    const configs = ensureProverConfigs(runConfig.provers)
    configs[proverIndex] = config
    updateRunConfig({ proverConfigs: configs })
  }

  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  // Update last refresh time when status changes
  useEffect(() => {
    if (status?.overall.timestamp) {
      setLastUpdate(status.overall.timestamp)
    }
  }, [status])
  
  // Ensure prover configs are in sync with number of provers
  useEffect(() => {
    const configs = ensureProverConfigs(runConfig.provers)
    if (JSON.stringify(configs) !== JSON.stringify(runConfig.proverConfigs)) {
      updateRunConfig({ proverConfigs: configs })
    }
  }, [runConfig.provers])

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Renders the current status information
   */
  const renderCurrentStatus = () => {
    if (!status) {
      return (
        <div style={{ color: '#666', fontStyle: 'italic' }}>
          No status information available
        </div>
      )
    }

    const verdictInfo = getVerdictDisplayInfo(status.overall.last_verdict)
    const progress = calculateProgress(problemInfo)

    return (
      <div className="status-display">
        {/* Main status line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className={`status-dot ${problemInfo.status}`}></span>
          <strong>Status:</strong> 
          <span>{getProblemStatusText()}</span>
        </div>

        {/* Error display */}
        {status.overall.error && (
          <div style={{ 
            marginBottom: '16px',
            padding: '12px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px'
          }}>
            <div style={{ marginBottom: '4px', fontWeight: 'bold', color: '#c00' }}>❌ Error:</div>
            <div style={{ fontSize: '13px', color: '#800', whiteSpace: 'pre-wrap' }}>
              {status.overall.error}
            </div>
          </div>
        )}

        {/* Progress information */}
        {problemInfo.totalRounds > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Progress:</strong> Round {problemInfo.currentRound} of {problemInfo.totalRounds}
              {progress > 0 && (
                <span style={{ marginLeft: '8px', color: '#666' }}>
                  ({progress}%)
                </span>
              )}
            </div>
            {isRunning && (
              <div style={{ 
                height: '4px', 
                background: '#e9ecef', 
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${progress}%`, 
                  height: '100%', 
                  background: '#007bff',
                  transition: 'width 0.3s'
                }}></div>
              </div>
            )}
          </div>
        )}

        {/* Current running model */}
        {status.overall.phase !== 'idle' && status.overall.phase !== 'completed' && (
          <div style={{ 
            marginBottom: '12px',
            padding: '8px',
            background: '#e8f4fd',
            border: '1px solid #bee5eb',
            borderRadius: '4px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔄 Currently Running:</div>
            <div style={{ fontSize: '13px' }}>
              {status.overall.phase === 'prover' && `Prover (${status.models?.prover || 'Unknown model'})`}
              {status.overall.phase === 'verifier' && `Verifier (${status.models?.verifier || 'Unknown model'})`}
              {status.overall.phase === 'summarizer' && `Summarizer (${status.models?.summarizer || 'Unknown model'})`}
              {status.overall.phase === 'setup' && 'Setting up run...'}
              {status.overall.phase === 'cleanup' && 'Cleaning up...'}
            </div>
          </div>
        )}

        {/* Last verdict */}
        {status.overall.last_verdict && (
          <div style={{ marginBottom: '12px' }}>
            <strong>Last Verdict:</strong>
            <span style={{ marginLeft: '8px', color: verdictInfo.color }}>
              {verdictInfo.emoji} {status.overall.last_verdict}
            </span>
          </div>
        )}

        {/* Last update time */}
        {lastUpdate > 0 && (
          <div style={{ marginTop: '12px', fontSize: '11px', color: '#999' }}>
            Last update: {formatRelativeTime(lastUpdate)}
          </div>
        )}
      </div>
    )
  }

  /**
   * Renders the runtime history
   */
  const renderRuntimeHistory = () => {
    if (!status?.rounds || status.rounds.length === 0) return null

    return (
      <div style={{ 
        maxHeight: '300px',
        overflowY: status.rounds.length > 3 ? 'auto' : 'visible',
        paddingRight: status.rounds.length > 3 ? '8px' : '0'
      }}>
        {status.rounds.map((round, index) => {
          const roundNum = index + 1
          if (!round.timings) return null
          
          return (
            <div key={roundNum} style={{ 
              marginBottom: '12px',
              padding: '10px',
              background: roundNum === status.rounds.length ? '#e8f4fd' : '#f8f9fa',
              border: roundNum === status.rounds.length ? '1px solid #bee5eb' : '1px solid #e9ecef',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '6px',
                color: roundNum === status.rounds.length ? '#0066cc' : '#495057'
              }}>
                Round {roundNum} {roundNum === status.rounds.length && '(Latest)'}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {(() => {
                  // Show individual prover times
                  const proverEntries = Object.entries(round.timings).filter(([key]) => key.startsWith('prover-'))
                  
                  if (proverEntries.length === 0) return null
                  
                  const proverTimes = proverEntries.map(([, data]) => formatTime(data.duration_s || 0))
                  return (
                    <div>• Provers: {proverTimes.join(', ')}</div>
                  )
                })()}
                
                {round.timings.verifier?.duration_s && (
                  <div>• Verifier: {formatTime(round.timings.verifier.duration_s)}</div>
                )}
                
                {round.timings.summarizer?.duration_s && (
                  <div>• Summarizer: {formatSummarizerTime(round.timings.summarizer.duration_s)}</div>
                )}
                
                {(() => {
                  // Use total_elapsed if available, otherwise calculate sum as fallback
                  const totalElapsed = round.timings.total_elapsed?.duration_s
                  const isLatestRound = roundNum === status.rounds.length
                  // Show "(so far)" only if it's the latest round and we're currently running
                  const showSoFar = isLatestRound && status.currentPhase && status.currentPhase !== 'idle'
                  
                  if (totalElapsed) {
                    return (
                      <div style={{ fontWeight: 'bold' }}>
                        • Total{showSoFar ? ' (so far)' : ''}: {formatTime(totalElapsed)}
                      </div>
                    )
                  }
                  
                  // Fallback: calculate realistic total accounting for parallel provers
                  const proverEntries = Object.entries(round.timings).filter(([key]) => key.startsWith('prover-'))
                  const proverMax = proverEntries.length > 0 
                    ? Math.max(...proverEntries.map(([, data]) => data.duration_s || 0))
                    : 0
                  const verifierTime = round.timings.verifier?.duration_s || 0
                  const summarizerTime = round.timings.summarizer?.duration_s || 0
                  const total = proverMax + verifierTime + summarizerTime
                  
                  return total > 0 ? (
                    <div style={{ fontWeight: 'bold' }}>
                      • Total{showSoFar ? ' (so far)' : ''}: {formatTime(total)}
                    </div>
                  ) : null
                })()}
              </div>
              
              {round.verdict && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#666' }}>
                  Verdict: {round.verdict}
                </div>
              )}
            </div>
          )
        }).filter(Boolean)}
      </div>
    )
  }


  /**
   * Format time in seconds to human readable
   */
  const formatTime = (seconds: number | null | undefined): string => {
    // Handle invalid or missing values
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
      return 'N/A'
    }
    
    // Ensure we have a valid number
    const time = Number(seconds)
    if (isNaN(time) || time < 0) {
      return 'N/A'
    }
    
    if (time < 60) {
      return `${time.toFixed(1)}s`
    }
    const minutes = Math.floor(time / 60)
    const secs = time % 60
    return `${minutes}m ${secs.toFixed(0)}s`
  }

  const formatSummarizerTime = (seconds: number | null | undefined): string => {
    // Handle invalid or missing values
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
      return 'N/A'
    }
    
    // Ensure we have a valid number
    const time = Number(seconds)
    if (isNaN(time) || time < 0) {
      return 'N/A'
    }
    
    // Always round up to whole seconds for summarizer
    if (time < 60) {
      return `${Math.ceil(time)}s`
    }
    const minutes = Math.floor(time / 60)
    const secs = Math.ceil(time % 60)
    // Handle case where seconds round up to 60
    if (secs === 60) {
      return `${minutes + 1}m 0s`
    }
    return `${minutes}m ${secs}s`
  }

  /**
   * Gets human-readable status text
   */
  const getProblemStatusText = (): string => {
    if (!status) return 'Unknown'
    
    if (status.overall.error) {
      return 'Error occurred'
    }
    
    if (isRunning) {
      return `Running (Round ${status.overall.current_round})`
    }
    
    if (status.overall.current_round > 0) {
      return 'Complete'
    }
    
    return 'Ready to start'
  }

  /**
   * Renders the run configuration form
   */
  const renderRunConfiguration = () => (
    <div style={{
      background: 'white',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #dee2e6',
      marginBottom: '20px'
    }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#333' }}>
        ⚙️ New run configuration
      </h4>
      
      {/* Model Preset */}
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="preset-select" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
          Model Preset
        </label>
        <select 
          id="preset-select"
          value={runConfig.preset} 
          onChange={e => updateRunConfig({ preset: e.target.value })}
          disabled={!canStart}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          {Object.entries(MODEL_PRESETS).map(([key, preset]) => (
            <option key={key} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rounds and Provers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label htmlFor="rounds-input" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
            Rounds
          </label>
          <input 
            id="rounds-input"
            type="number" 
            min={1} 
            max={100}
            value={runConfig.rounds} 
            onChange={e => updateRunConfig({ rounds: parseInt(e.target.value || '1') })}
            disabled={!canStart}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div>
          <label htmlFor="provers-input" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
            Provers
          </label>
          <input 
            id="provers-input"
            type="number" 
            min={1} 
            max={10}
            value={runConfig.provers} 
            onChange={e => updateRunConfig({ provers: parseInt(e.target.value || '1') })}
            disabled={!canStart}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Temperature (only for non-GPT-5) */}
      {runConfig.preset !== 'gpt5' && (
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="temperature-input" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
            Temperature
          </label>
          <input 
            id="temperature-input"
            type="number" 
            min={0} 
            max={2} 
            step={0.1}
            value={runConfig.temperature} 
            onChange={e => updateRunConfig({ temperature: parseFloat(e.target.value || '0.4') })}
            disabled={!canStart}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            Higher values make output more creative
          </div>
        </div>
      )}

      {/* GPT-5 temperature notice */}
      {runConfig.preset === 'gpt5' && (
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          background: '#f0f8ff',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #b3d9ff',
          marginBottom: '16px'
        }}>
          ℹ️ GPT-5 uses default temperature (temperature setting not available)
        </div>
      )}

      {/* Prover Configurations */}
      {runConfig.provers > 1 && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>
            Prover Configurations
          </label>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {ensureProverConfigs(runConfig.provers).map((config, index) => (
              <ProverConfigComponent
                key={index}
                proverIndex={index + 1}
                config={config}
                onChange={(newConfig) => updateProverConfig(index, newConfig)}
                focusOptions={focusOptions}
              />
            ))}
          </div>
        </div>
      )}

      {/* Start Button */}
      <div style={{ marginTop: '16px' }}>
        <button 
          className="btn btn-success"
          onClick={handleStartRun}
          disabled={!canStart}
          style={{ 
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ▶️ Start Research
        </button>
      </div>
    </div>
  )

  /**
   * Renders action buttons
   */
  const renderActionButtons = () => (
    <>
      {/* Stop Research button when running */}
      {isRunning && (
        <div style={{ marginBottom: '12px' }}>
          <button 
            className="btn btn-danger"
            onClick={handleStop}
            disabled={!canStop}
            style={{ 
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ⏹ Stop Research
          </button>
        </div>
      )}

      {/* Management actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '8px' 
      }}>
        <button 
          className="btn btn-danger" 
          onClick={onResetProblem}
          disabled={loading}
          style={{ fontSize: '12px', padding: '6px 10px' }}
          title="Keep task but delete all prover/verifier interactions"
        >
          🔄 Reset Problem
        </button>
        
        <button 
          className="btn btn-danger" 
          onClick={onDeleteRounds}
          disabled={loading || !status?.rounds?.length}
          style={{ fontSize: '12px', padding: '6px 10px' }}
        >
          🗑️ Delete Rounds
        </button>
        
        <button 
          className="btn btn-danger" 
          onClick={onDeleteProblem}
          disabled={loading}
          style={{ fontSize: '12px', padding: '6px 10px' }}
        >
          ❌ Delete Problem
        </button>
      </div>
    </>
  )

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className="status-panel">
      {/* Status display */}
      <div style={{ 
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#333' }}>
          📊 Current Status
        </h4>
        {renderCurrentStatus()}
      </div>

      {/* Runtime History */}
      {status?.rounds && status.rounds.length > 0 && (
        <div style={{ 
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#333' }}>
            ⏱️ Model Runtime History
          </h4>
          {renderRuntimeHistory()}
        </div>
      )}

      {/* Configuration form - only show when not running */}
      {!isRunning && renderRunConfiguration()}

      {/* Action buttons */}
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#333' }}>
          🎮 Actions
        </h4>
        {renderActionButtons()}
      </div>

      {/* Loading indicator */}
      {(loading || localLoading) && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px',
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#856404',
          textAlign: 'center'
        }}>
          ⏳ Processing...
        </div>
      )}
    </div>
  )
}