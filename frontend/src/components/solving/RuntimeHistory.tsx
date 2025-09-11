import React from 'react';
import { ProblemStatus } from './types';

interface RuntimeHistoryProps {
  status: ProblemStatus;
}

/**
 * Format time duration in a human-readable way
 */
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

/**
 * Format summarizer time with special handling for longer durations
 */
const formatSummarizerTime = (seconds: number): string => {
  const formatted = formatTime(seconds);
  // Add a note if it's taking a long time
  if (seconds > 300) { // 5 minutes
    return `${formatted} (comprehensive summary)`;
  }
  return formatted;
};

export const RuntimeHistory: React.FC<RuntimeHistoryProps> = ({ status }) => {
  if (!status?.rounds || status.rounds.length === 0) {
    return null;
  }

  return (
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
      
      <div style={{ 
        maxHeight: '300px',
        overflowY: status.rounds.length > 3 ? 'auto' : 'visible',
        paddingRight: status.rounds.length > 3 ? '8px' : '0'
      }}>
        {status.rounds.map((round, index) => {
          const roundNum = index + 1;
          if (!round.timings) return null;
          
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
                {/* Vector Store Status */}
                {round.timings.vector_store && (
                  <div style={{ color: round.timings.vector_store.status === 'success' ? '#28a745' : round.timings.vector_store.status === 'failed' ? '#dc3545' : '#6c757d' }}>
                    • Vector Store: {(() => {
                      const vs = round.timings.vector_store;
                      if (vs.status === 'success') {
                        return `✓ Ready (${formatTime(vs.duration_s || 0)}, ${vs.num_papers || 0} papers)`;
                      } else if (vs.status === 'failed') {
                        return `✗ Failed (${vs.error || 'Unknown error'})`;
                      } else if (vs.status === 'skipped') {
                        return `⊝ Skipped (no papers available)`;
                      } else {
                        return `? Unknown status`;
                      }
                    })()}
                  </div>
                )}

                {(() => {
                  // Show individual prover times
                  const proverEntries = Object.entries(round.timings).filter(([key]) => key.startsWith('prover-'));
                  
                  if (proverEntries.length === 0) return null;
                  
                  const proverTimes = proverEntries.map(([, data]) => formatTime(data.duration_s || 0));
                  return (
                    <div>• Provers: {proverTimes.join(', ')}</div>
                  );
                })()}
                
                {round.timings.verifier?.duration_s && (
                  <div>• Verifier: {formatTime(round.timings.verifier.duration_s)}</div>
                )}
                
                {round.timings.summarizer?.duration_s && (
                  <div>• Summarizer: {formatSummarizerTime(round.timings.summarizer.duration_s)}</div>
                )}
                
                {(() => {
                  // Use total_elapsed if available, otherwise calculate sum as fallback
                  const totalElapsed = round.timings.total_elapsed?.duration_s;
                  const isLatestRound = roundNum === status.rounds.length;
                  // Show "(so far)" only if it's the latest round and we're currently running
                  const showSoFar = isLatestRound && status.overall.current_phase && status.overall.current_phase !== 'idle';
                  
                  if (totalElapsed) {
                    return (
                      <div style={{ fontWeight: 'bold' }}>
                        • Total{showSoFar ? ' (so far)' : ''}: {formatTime(totalElapsed)}
                      </div>
                    );
                  }
                  
                  // Fallback: calculate realistic total accounting for parallel provers
                  const proverEntries = Object.entries(round.timings).filter(([key]) => key.startsWith('prover-'));
                  const proverMax = proverEntries.length > 0 
                    ? Math.max(...proverEntries.map(([, data]) => data.duration_s || 0))
                    : 0;
                  const verifierTime = round.timings.verifier?.duration_s || 0;
                  const summarizerTime = round.timings.summarizer?.duration_s || 0;
                  const total = proverMax + verifierTime + summarizerTime;
                  
                  return total > 0 ? (
                    <div style={{ fontWeight: 'bold' }}>
                      • Total{showSoFar ? ' (so far)' : ''}: {formatTime(total)}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};