import React from 'react';

interface ProverConfigProps {
  proverIndex: number;
  config: ProverConfig;
  onChange: (config: ProverConfig) => void;
  focusOptions: Array<{key: string, name: string}>;
}

export interface ProverConfig {
  calculator: boolean;
  focus: string;
}

const ProverConfig: React.FC<ProverConfigProps> = ({
  proverIndex,
  config,
  onChange,
  focusOptions
}) => {
  const handleCalculatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...config,
      calculator: e.target.checked
    });
  };

  const handleFocusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...config,
      focus: e.target.value
    });
  };

  return (
    <div className="border rounded-md p-3 mb-2 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">Prover {proverIndex}</h4>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`calculator-${proverIndex}`}
            checked={config.calculator}
            onChange={handleCalculatorChange}
            className="mr-2"
          />
          <label 
            htmlFor={`calculator-${proverIndex}`}
            className="text-sm cursor-pointer"
          >
            Calculator access
          </label>
        </div>
        
        <div>
          <label 
            htmlFor={`focus-${proverIndex}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Focus instructions:
          </label>
          <select
            id={`focus-${proverIndex}`}
            value={config.focus}
            onChange={handleFocusChange}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {focusOptions.map(option => (
              <option key={option.key} value={option.key}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProverConfig;