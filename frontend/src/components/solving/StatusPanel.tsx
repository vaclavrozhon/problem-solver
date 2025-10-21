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
  VerifierConfig,
  ModelPreset, 
  AppMessage,
  StatusDisplayProps,
  MessageHandlerProps,
  FileInfo
} from './types'
import { RuntimeHistory } from './RuntimeHistory'
import { 
  getProblemInfo, 
  isProblemRunning,
  getVerdictDisplayInfo,
  calculateProgress,
  validateRunParameters,
  organizeTimings,
  formatRelativeTime,
  getStatusDescription
} from './utils'
import { getStatus, runRound, stopProblem, listFiles, deleteRounds, getProblemFilesRaw } from '../../api'
import { getCredits } from '../../api'
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
  onDeleteProblem,
  onResetProblem
}: StatusPanelProps) {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  // Run configuration state (persisted across sessions)
  const [runConfig, setRunConfig] = useState<RunParameters>({
    rounds: 1,
    provers: 1,
    preset: 'gpt5',
    focusDescription: ''
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
  const [availableFiles, setAvailableFiles] = useState<FileInfo[]>([])
  const [credits, setCredits] = useState<{ used: number, limit: number, available: number } | null>(null)

  // Round meta (timings, quick summary)
  const [roundMeta, setRoundMeta] = useState<Array<{ round: number, one_line_summary?: string, durations: { provers_total?: number, per_prover?: Record<string, number>, verifier?: number, summarizer?: number } }>>([])

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================
  
  // Get simplified problem info for display
  const problemInfo = getProblemInfo(problemName, status)
  const isRunning = isProblemRunning(status)
  const canStart = !loading && !localLoading && !isRunning
  const canStop = !loading && !localLoading && isRunning
  const isIdle = !isRunning

  // =============================================================================
  // HANDLERS
  // =============================================================================
  
  /**
   * Handles starting a new research run
   * Validates parameters and calls API
   */
  const handleStartRun = async () => {
    // Prevent double-clicking by checking if already starting
    if (!canStart) return
    
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

      const result = await runRound(
        problemName, 
        runConfig.rounds, 
        runConfig.provers, 
        0, 
        runConfig.preset, 
        runConfig.proverConfigs,
        runConfig.focusDescription,
        runConfig.verifierConfig,
        runConfig.summarizerModel
      )
      
      setMessage({
        type: 'success',
        text: `Started ${runConfig.rounds} round(s) with ${runConfig.provers} prover(s)`
      })

    } catch (error: any) {
      console.error('Failed to start run:', error)
      try {
        const parsed = JSON.parse(error.message)
        if (parsed?.code === 'CREDIT_LIMIT_EXCEEDED') {
          setMessage({ type: 'error', text: `Credit limit exceeded (${parsed.credits_used} used of ${parsed.credits_limit}). Send me a mail if you want more.` })
          try { const data = await getCredits(); setCredits({ used: Number(data.credits_used||0), limit: Number(data.credits_limit||0), available: Number(data.credits_available||0) }) } catch {}
          return
        }
      } catch {}
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
    
    // Create default paper access for all available papers
    const defaultPaperAccess: Record<string, boolean> = {}
    availableFiles.filter(file => file.type === 'paper').forEach(paper => {
      defaultPaperAccess[paper.path] = true  // Default: access to all papers
    })
    
    for (let i = 0; i < numProvers; i++) {
      const defaultConfig = { 
        calculator: true,  // Default: calculator enabled
        focus: 'default',
        paperAccess: defaultPaperAccess
      }
      
      // Merge with existing config, but ensure paper access is updated with new papers
      const existing = current[i]
      if (existing) {
        const mergedPaperAccess = { ...defaultPaperAccess, ...existing.paperAccess }
        configs.push({
          ...existing,
          paperAccess: mergedPaperAccess
        })
      } else {
        configs.push(defaultConfig)
      }
    }
    
    return configs
  }
  
  /**
   * Update all prover configurations
   */
  const updateProverConfigs = (configs: ProverConfig[]) => {
    updateRunConfig({ proverConfigs: configs })
  }

  /**
   * Initialize or adjust verifier configuration based on available papers
   */
  const ensureVerifierConfig = (): VerifierConfig => {
    const current = runConfig.verifierConfig
    
    // Create default paper access for all available papers
    const defaultPaperAccess: Record<string, boolean> = {}
    availableFiles.filter(file => file.type === 'paper').forEach(paper => {
      defaultPaperAccess[paper.path] = true  // Default: access to all papers
    })
    
    const defaultConfig = { 
      calculator: true,  // Default: calculator enabled
      focus: 'default',
      paperAccess: defaultPaperAccess,
      model: 'gpt-5'
    }
    
    if (current) {
      // Merge with existing config, but ensure paper access is updated with new papers
      const mergedPaperAccess = { ...defaultPaperAccess, ...current.paperAccess }
      return {
        ...current,
        paperAccess: mergedPaperAccess
      }
    } else {
      return defaultConfig
    }
  }

  /**
   * Update verifier configuration
   */
  const updateVerifierConfig = (config: VerifierConfig) => {
    updateRunConfig({ verifierConfig: config })
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
  
  // Load files when problem changes
  useEffect(() => {
    if (problemName) {
      loadFiles()
    }
  }, [problemName])

  // Credits moved to header; keep minimal refresh only for error toast accuracy
  useEffect(() => {
    const refreshCredits = async () => {
      try {
        const data = await getCredits()
        setCredits({
          used: Number(data.credits_used || 0),
          limit: Number(data.credits_limit || 0),
          available: Number(data.credits_available || Math.max(0, Number(data.credits_limit || 0) - Number(data.credits_used || 0)))
        })
      } catch {
        setCredits(null)
      }
    }
    refreshCredits()
  }, [status?.overall?.current_round])
  
  // Load available files
  const loadFiles = async () => {
    try {
      const fileList = await listFiles(problemName)
      setAvailableFiles(fileList)
    } catch (err) {
      console.error('Failed to load files for prover configuration:', err)
      setAvailableFiles([])
    }
  }
  
  // Ensure prover configs are in sync with number of provers
  useEffect(() => {
    const configs = ensureProverConfigs(runConfig.provers)
    if (JSON.stringify(configs) !== JSON.stringify(runConfig.proverConfigs)) {
      updateRunConfig({ proverConfigs: configs })
    }
  }, [runConfig.provers])

  // Ensure verifier config is initialized when available files change
  useEffect(() => {
    const config = ensureVerifierConfig()
    if (JSON.stringify(config) !== JSON.stringify(runConfig.verifierConfig)) {
      updateRunConfig({ verifierConfig: config })
    }
  }, [availableFiles])

  // Load round meta files when status or problem changes
  useEffect(() => {
    const loadRoundMeta = async () => {
      try {
        if (!problemName) { setRoundMeta([]); return }
        const files = await getProblemFilesRaw(problemName, { file_type: 'round_meta' })
        const metas: Array<{ round: number, one_line_summary?: string, durations: { provers_total?: number, per_prover?: Record<string, number>, verifier?: number, summarizer?: number } }> = []
        for (const f of (files || [])) {
          try {
            const data = JSON.parse(f.content || '{}')
            const r = Number(data.round || 0)
            if (!r || r <= 0) continue
            const stages = data.stages || {}
            const provers = stages.provers || {}
            const perProver: Record<string, number> = {}
            let proversTotal = 0
            Object.keys(provers).forEach(k => {
              const d = Number((provers[k]?.duration_s) || 0)
              perProver[k] = d
              proversTotal += d
            })
            const meta = {
              round: r,
              one_line_summary: data.one_line_summary,
              durations: {
                provers_total: proversTotal > 0 ? proversTotal : undefined,
                per_prover: perProver,
                verifier: Number(stages.verifier?.duration_s || 0) || undefined,
                summarizer: Number(stages.summarizer?.duration_s || 0) || undefined,
              }
            }
            metas.push(meta)
          } catch (e) {
            // ignore malformed meta
          }
        }
        metas.sort((a,b) => b.round - a.round)
        setRoundMeta(metas)
      } catch (e) {
        setRoundMeta([])
      }
    }
    loadRoundMeta()
  }, [problemName, status?.overall?.current_round])

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

    // Get the latest verdict from completed rounds
    const getLatestVerdict = () => {
      if (!status?.rounds || status.rounds.length === 0) return undefined
      
      // Find the latest completed round with a verdict
      const completedRoundsWithVerdicts = status.rounds
        .filter(round => round.status === 'completed' && round.verdict)
        .sort((a, b) => b.number - a.number) // Sort by round number, latest first
      
      return completedRoundsWithVerdicts.length > 0 ? completedRoundsWithVerdicts[0].verdict : undefined
    }
    
    const verdictInfo = getVerdictDisplayInfo(getLatestVerdict() as any)
    const progress = calculateProgress(problemInfo)

    // If complete and not running, show minimal status
    const isComplete = !isRunning 
      && status.overall.phase === 'idle' 
      && !!status.overall.last_round_completed 
      && ((status.overall.remaining_rounds ?? 0) === 0)
    
    if (isComplete) {
      return (
        <div className="status-display">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`status-dot ${problemInfo.status}`}></span>
            <strong>Status:</strong> 
            <span>Complete</span>
          </div>
        </div>
      )
    }

    return (
      <div className="status-display">
        {/* Main status line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className={`status-dot ${problemInfo.status}`}></span>
          <strong>Status:</strong> 
          <span>{getStatusDescription(problemInfo, status)}</span>
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
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#c00' }}>❌ Error:</div>
            
            {/* Show component and phase if available */}
            {(status.overall.error_component || status.overall.error_phase) && (
              <div style={{ 
                marginBottom: '8px', 
                fontSize: '12px', 
                color: '#666',
                fontWeight: 'bold'
              }}>
                {status.overall.error_component && (
                  <span>Component: {status.overall.error_component}</span>
                )}
                {status.overall.error_component && status.overall.error_phase && ' • '}
                {status.overall.error_phase && (
                  <span>Phase: {status.overall.error_phase}</span>
                )}
              </div>
            )}
            
            <div style={{ fontSize: '13px', color: '#800', whiteSpace: 'pre-wrap' }}>
              {status.overall.error}
            </div>
          </div>
        )}

        {/* Progress bar */}
        {problemInfo.totalRounds > 0 && isRunning && (
          <div style={{ marginBottom: '12px' }}>
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
          </div>
        )}

        {/* Current running model */}
        {status.overall.phase !== 'idle' && (
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
              {/* setup/cleanup not part of typed phases; omit */}
            </div>
          </div>
        )}

        {/* Last verdict */}
        {verdictInfo && (
          <div style={{ marginBottom: '12px' }}>
            <strong>Last Verdict:</strong>
            <span style={{ marginLeft: '8px', color: verdictInfo.color }}>
              {verdictInfo.emoji} {getLatestVerdict()}
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
          onChange={e => updateRunConfig({ preset: e.target.value as any })}
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

      {/* Focus Description */}
      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="focus-description-input" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
          Focus Description (Optional)
        </label>
        <textarea
          id="focus-description-input"
          value={runConfig.focusDescription || ''}
          onChange={e => updateRunConfig({ focusDescription: e.target.value })}
          placeholder="Describe what the prover and verifier should focus on during this round (e.g., 'Focus on the algorithmic complexity analysis', 'Pay special attention to edge cases')"
          disabled={!canStart}
          rows={3}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '14px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
        />
        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
          This description will be included in the prompts for all provers and the verifier to help guide their analysis.
        </div>
      </div>

      {/* Temperature removed for GPT-5 models */}


      {/* Prover Configurations */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>
            Prover Configurations
          </label>
          <div style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto' }}>
            <ProverConfigComponent
              proverConfigs={ensureProverConfigs(runConfig.provers)}
              onChange={updateProverConfigs}
              focusOptions={focusOptions}
              availablePapers={availableFiles}
              numProvers={runConfig.provers}
            />
          </div>
        </div>

      {/* Verifier Configuration */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>
          Verifier Configuration
        </label>
        <div style={{ 
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '12px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '12px', alignItems: 'center' }}>
            {/* Verifier label */}
            <div style={{ fontWeight: '500', fontSize: '14px' }}>
              Verifier
            </div>
            
            {/* Calculator checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={ensureVerifierConfig().calculator}
                  onChange={e => updateVerifierConfig({
                    ...ensureVerifierConfig(),
                    calculator: e.target.checked
                  })}
                  disabled={!canStart}
                />
                Calculator
              </label>
            </div>
            
            {/* Focus instructions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={ensureVerifierConfig().focus}
                onChange={e => updateVerifierConfig({
                  ...ensureVerifierConfig(),
                  focus: e.target.value
                })}
                disabled={!canStart}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  background: 'white'
                }}
              >
                {focusOptions.map(option => (
                  <option key={option.key} value={option.key}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Verifier model selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={ensureVerifierConfig().model || 'gpt-5'}
                onChange={e => updateVerifierConfig({
                  ...ensureVerifierConfig(),
                  model: e.target.value
                })}
                disabled={!canStart}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  background: 'white'
                }}
              >
                <option value="gpt-5">GPT-5</option>
                <option value="gpt-5-mini">GPT-5 mini</option>
                <option value="gpt-4">GPT-4</option>
              </select>
            </div>
          </div>
          
          {/* Paper access checkboxes */}
          {availableFiles.filter(file => file.type === 'paper').length > 0 && (
            <div style={{ marginTop: '12px', borderTop: '1px solid #dee2e6', paddingTop: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Paper Access:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableFiles.filter(file => file.type === 'paper').map(paper => (
                  <label key={paper.path} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '11px',
                    background: 'white',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: '1px solid #dee2e6'
                  }}>
                    <input
                      type="checkbox"
                      checked={ensureVerifierConfig().paperAccess?.[paper.path] || false}
                      onChange={e => {
                        const config = ensureVerifierConfig()
                        const paperAccess = { ...config.paperAccess }
                        paperAccess[paper.path] = e.target.checked
                        updateVerifierConfig({
                          ...config,
                          paperAccess
                        })
                      }}
                      disabled={!canStart}
                    />
                    📄 {paper.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summarizer model */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>
          Summarizer Model
        </label>
        <select 
          value={runConfig.summarizerModel || 'gpt-5-mini'}
          onChange={e => updateRunConfig({ summarizerModel: e.target.value })}
          disabled={!canStart}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="gpt-5-mini">GPT-5 mini</option>
          <option value="gpt-5">GPT-5</option>
          <option value="gpt-4">GPT-4</option>
        </select>
      </div>

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
        {/* Delete last N rounds (idle only) */}
        <DeleteRoundsControl 
          problemName={problemName} 
          totalRounds={problemInfo.totalRounds}
          disabled={!isIdle || loading} 
          setMessage={setMessage} 
        />
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
      {/* Credits summary moved to header */}
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
      {status && <RuntimeHistory status={status} />}

      {/* Round Meta Timings */}
      {roundMeta.length > 0 && (
        <div style={{ 
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          marginTop: '20px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
            ⏱ Round timings and summaries
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {roundMeta.map(meta => (
              <div key={meta.round} style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '6px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Round {meta.round}</div>
                <div style={{ fontSize: '12px', color: '#555', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <span>Provers: {meta.durations.provers_total ? `${meta.durations.provers_total.toFixed(1)}s` : '—'}</span>
                  <span>Verifier: {meta.durations.verifier ? `${meta.durations.verifier.toFixed(1)}s` : '—'}</span>
                  <span>Summarizer: {meta.durations.summarizer ? `${meta.durations.summarizer.toFixed(1)}s` : '—'}</span>
                </div>
                {meta.one_line_summary && (
                  <div style={{ fontSize: '12px', color: '#333', marginTop: '4px' }}>
                    “{meta.one_line_summary}”
                  </div>
                )}
              </div>
            ))}
          </div>
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

function DeleteRoundsControl({ problemName, totalRounds, disabled, setMessage }: { problemName: string | null, totalRounds: number, disabled: boolean, setMessage: (m: any) => void }) {
  const [n, setN] = React.useState<number>(1)
  const [busy, setBusy] = React.useState<boolean>(false)
  const canDelete = !disabled && !busy && n > 0
  const onDelete = async () => {
    if (!problemName) return
    // Confirm destructive action
    const confirmMsg = `You will remove the last ${n} round(s) from ${totalRounds} total rounds.\n\nThis cannot be undone. Continue?`
    const confirmed = window.confirm(confirmMsg)
    if (!confirmed) return
    try {
      setBusy(true)
      const res = await deleteRounds(problemName, n)
      setMessage({ type: 'success', text: res?.message || `Deleted last ${n} round(s)` })
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Failed to delete rounds' })
    } finally {
      setBusy(false)
    }
  }
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <input
        type="number"
        min={1}
        value={n}
        onChange={e => setN(parseInt(e.target.value || '1', 10))}
        disabled={disabled || busy}
        style={{ width: '70px', padding: '6px', fontSize: '12px' }}
        title="Number of latest rounds to delete"
      />
      <button
        className="btn btn-danger"
        onClick={onDelete}
        disabled={!canDelete}
        style={{ fontSize: '12px', padding: '6px 10px' }}
        title={disabled ? 'Available only when idle' : 'Delete the most recent rounds'}
      >
        🗑️ Delete last N rounds
      </button>
    </div>
  )
}