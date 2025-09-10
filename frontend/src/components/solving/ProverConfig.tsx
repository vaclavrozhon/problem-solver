import React from 'react';
import { FileInfo } from './types';

interface ProverConfigTableProps {
  proverConfigs: ProverConfig[];
  onChange: (configs: ProverConfig[]) => void;
  focusOptions: Array<{key: string, name: string}>;
  availablePapers: FileInfo[];
  numProvers: number;
}

export interface ProverConfig {
  calculator: boolean;
  focus: string;
  paperAccess?: Record<string, boolean>;
}

const ProverConfigTable: React.FC<ProverConfigTableProps> = ({
  proverConfigs,
  onChange,
  focusOptions,
  availablePapers,
  numProvers
}) => {
  // Ensure we have configs for all provers
  const ensureConfigs = (): ProverConfig[] => {
    const configs: ProverConfig[] = [];
    for (let i = 0; i < numProvers; i++) {
      const existing = proverConfigs[i];
      configs.push(existing || { 
        calculator: false, 
        focus: 'default',
        paperAccess: {}
      });
    }
    return configs;
  };

  const handleConfigChange = (proverIndex: number, field: keyof ProverConfig, value: any) => {
    const configs = ensureConfigs();
    configs[proverIndex] = {
      ...configs[proverIndex],
      [field]: value
    };
    onChange(configs);
  };

  const handlePaperAccessChange = (proverIndex: number, paperPath: string, hasAccess: boolean) => {
    const configs = ensureConfigs();
    const paperAccess = { ...configs[proverIndex].paperAccess } || {};
    paperAccess[paperPath] = hasAccess;
    
    configs[proverIndex] = {
      ...configs[proverIndex],
      paperAccess
    };
    onChange(configs);
  };

  const configs = ensureConfigs();
  const paperFiles = availablePapers.filter(file => file.type === 'paper');

  if (numProvers === 0) {
    return <div style={{ color: '#666', fontStyle: 'italic' }}>No provers configured</div>;
  }

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '4px', 
      overflow: 'hidden',
      fontSize: '12px'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ 
              padding: '8px', 
              textAlign: 'left', 
              borderBottom: '1px solid #ddd',
              fontWeight: '600',
              fontSize: '12px'
            }}>
              Prover
            </th>
            <th style={{ 
              padding: '8px', 
              textAlign: 'center', 
              borderBottom: '1px solid #ddd',
              fontWeight: '600',
              fontSize: '12px'
            }}>
              Calculator
            </th>
            <th style={{ 
              padding: '8px', 
              textAlign: 'left', 
              borderBottom: '1px solid #ddd',
              fontWeight: '600',
              fontSize: '12px'
            }}>
              Focus Instructions
            </th>
            {paperFiles.map((paper) => (
              <th key={paper.path} style={{ 
                padding: '8px', 
                textAlign: 'center', 
                borderBottom: '1px solid #ddd',
                fontWeight: '600',
                fontSize: '11px',
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                📄 {paper.name.replace(/^papers\//, '')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {configs.map((config, index) => (
            <tr key={index} style={{ 
              backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
            }}>
              <td style={{ 
                padding: '8px', 
                fontWeight: '500',
                borderBottom: index === configs.length - 1 ? 'none' : '1px solid #eee'
              }}>
                Prover {index + 1}
              </td>
              <td style={{ 
                padding: '8px', 
                textAlign: 'center',
                borderBottom: index === configs.length - 1 ? 'none' : '1px solid #eee'
              }}>
                <input
                  type="checkbox"
                  checked={config.calculator}
                  onChange={(e) => handleConfigChange(index, 'calculator', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </td>
              <td style={{ 
                padding: '8px',
                borderBottom: index === configs.length - 1 ? 'none' : '1px solid #eee'
              }}>
                <select
                  value={config.focus}
                  onChange={(e) => handleConfigChange(index, 'focus', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '2px 4px',
                    fontSize: '11px',
                    border: '1px solid #ccc',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  {focusOptions.map(option => (
                    <option key={option.key} value={option.key}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </td>
              {paperFiles.map((paper) => (
                <td key={paper.path} style={{ 
                  padding: '8px', 
                  textAlign: 'center',
                  borderBottom: index === configs.length - 1 ? 'none' : '1px solid #eee'
                }}>
                  <input
                    type="checkbox"
                    checked={config.paperAccess?.[paper.path] || false}
                    onChange={(e) => handlePaperAccessChange(index, paper.path, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProverConfigTable;