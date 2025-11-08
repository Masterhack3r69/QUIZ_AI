'use client';

import React, { useState, useEffect } from 'react';
import { QuizDistribution } from '@/types';
import { Button } from '@/components/ui/button';

export interface QuestionDistributionProps {
  totalQuestions: number;
  distribution: QuizDistribution;
  onChange: (distribution: QuizDistribution) => void;
  mode?: 'percentage' | 'count';
}

interface PresetDistribution {
  name: string;
  description: string;
  distribution: QuizDistribution;
}

const PRESETS: PresetDistribution[] = [
  {
    name: 'All Multiple Choice',
    description: '100% Multiple Choice questions',
    distribution: {
      multipleChoice: 100,
      trueFalse: 0,
      fillInBlank: 0,
      matching: 0,
    },
  },
  {
    name: 'Mixed',
    description: '70% MC, 20% T/F, 10% Fill-in',
    distribution: {
      multipleChoice: 70,
      trueFalse: 20,
      fillInBlank: 10,
      matching: 0,
    },
  },
  {
    name: 'Balanced',
    description: 'Equal distribution across all types',
    distribution: {
      multipleChoice: 25,
      trueFalse: 25,
      fillInBlank: 25,
      matching: 25,
    },
  },
];

const QUESTION_TYPE_LABELS = {
  multipleChoice: 'Multiple Choice',
  trueFalse: 'True/False',
  fillInBlank: 'Fill-in-the-Blank',
  matching: 'Matching',
};

const QUESTION_TYPE_COLORS = {
  multipleChoice: 'bg-blue-500',
  trueFalse: 'bg-green-500',
  fillInBlank: 'bg-yellow-500',
  matching: 'bg-purple-500',
};

export function QuestionDistribution({
  totalQuestions,
  distribution,
  onChange,
  mode = 'percentage',
}: QuestionDistributionProps) {
  const [localDistribution, setLocalDistribution] = useState<QuizDistribution>(distribution);
  const [validationError, setValidationError] = useState<string>('');

  // Update local state when prop changes
  useEffect(() => {
    setLocalDistribution(distribution);
  }, [distribution]);

  // Validate distribution
  const validateDistribution = (dist: QuizDistribution): string => {
    const total = dist.multipleChoice + dist.trueFalse + dist.fillInBlank + dist.matching;
    
    if (mode === 'percentage') {
      if (total !== 100) {
        return `Total must equal 100% (currently ${total}%)`;
      }
    } else {
      if (total !== totalQuestions) {
        return `Total must equal ${totalQuestions} questions (currently ${total})`;
      }
    }

    // Check minimum 1 question per type if percentage > 0
    const types = Object.keys(dist) as (keyof QuizDistribution)[];
    for (const type of types) {
      if (dist[type] > 0) {
        if (mode === 'percentage') {
          const count = Math.round((dist[type] / 100) * totalQuestions);
          if (count < 1) {
            return `${QUESTION_TYPE_LABELS[type]}: ${dist[type]}% results in less than 1 question. Increase percentage or set to 0.`;
          }
        }
      }
    }

    return '';
  };

  // Handle input change
  const handleChange = (type: keyof QuizDistribution, value: number) => {
    const newDistribution = {
      ...localDistribution,
      [type]: Math.max(0, value),
    };
    
    setLocalDistribution(newDistribution);
    
    const error = validateDistribution(newDistribution);
    setValidationError(error);
    
    if (!error) {
      onChange(newDistribution);
    }
  };

  // Handle slider change
  const handleSliderChange = (type: keyof QuizDistribution, value: number) => {
    handleChange(type, value);
  };

  // Apply preset
  const applyPreset = (preset: PresetDistribution) => {
    let newDistribution: QuizDistribution;
    
    if (mode === 'count') {
      // Convert percentages to counts
      newDistribution = {
        multipleChoice: Math.round((preset.distribution.multipleChoice / 100) * totalQuestions),
        trueFalse: Math.round((preset.distribution.trueFalse / 100) * totalQuestions),
        fillInBlank: Math.round((preset.distribution.fillInBlank / 100) * totalQuestions),
        matching: Math.round((preset.distribution.matching / 100) * totalQuestions),
      };
      
      // Adjust for rounding errors
      const total = newDistribution.multipleChoice + newDistribution.trueFalse + 
                    newDistribution.fillInBlank + newDistribution.matching;
      const diff = totalQuestions - total;
      if (diff !== 0) {
        newDistribution.multipleChoice += diff;
      }
    } else {
      newDistribution = preset.distribution;
    }
    
    setLocalDistribution(newDistribution);
    setValidationError('');
    onChange(newDistribution);
  };

  // Calculate actual question counts for display
  const getQuestionCount = (type: keyof QuizDistribution): number => {
    if (mode === 'count') {
      return localDistribution[type];
    }
    return Math.round((localDistribution[type] / 100) * totalQuestions);
  };

  // Get max value for inputs
  const getMaxValue = (): number => {
    return mode === 'percentage' ? 100 : totalQuestions;
  };

  const total = localDistribution.multipleChoice + localDistribution.trueFalse + 
                localDistribution.fillInBlank + localDistribution.matching;

  return (
    <div className="space-y-6">
      {/* Preset Buttons */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Presets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="p-3 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              type="button"
            >
              <div className="font-medium text-gray-900 text-sm">{preset.name}</div>
              <div className="text-xs text-gray-600 mt-1">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Distribution Inputs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Custom Distribution {mode === 'percentage' ? '(%)' : '(Count)'}
        </h3>
        <div className="space-y-4">
          {(Object.keys(localDistribution) as (keyof QuizDistribution)[]).map((type) => (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor={`dist-${type}`} className="text-sm font-medium text-gray-700">
                  {QUESTION_TYPE_LABELS[type]}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {localDistribution[type]}{mode === 'percentage' ? '%' : ''}
                  </span>
                  {mode === 'percentage' && (
                    <span className="text-xs text-gray-500">
                      ({getQuestionCount(type)} {getQuestionCount(type) === 1 ? 'question' : 'questions'})
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Slider */}
                <input
                  id={`dist-${type}`}
                  type="range"
                  min="0"
                  max={getMaxValue()}
                  step="1"
                  value={localDistribution[type]}
                  onChange={(e) => handleSliderChange(type, parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  aria-label={`${QUESTION_TYPE_LABELS[type]} distribution`}
                />
                
                {/* Number Input */}
                <input
                  type="number"
                  min="0"
                  max={getMaxValue()}
                  value={localDistribution[type]}
                  onChange={(e) => handleChange(type, parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label={`${QUESTION_TYPE_LABELS[type]} value`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Representation - Bar Chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Distribution Preview</h3>
        <div className="space-y-3">
          {/* Stacked Bar */}
          <div className="h-8 flex rounded-lg overflow-hidden border-2 border-gray-200">
            {(Object.keys(localDistribution) as (keyof QuizDistribution)[]).map((type) => {
              const percentage = mode === 'percentage' 
                ? localDistribution[type]
                : (localDistribution[type] / totalQuestions) * 100;
              
              if (percentage === 0) return null;
              
              return (
                <div
                  key={type}
                  className={`${QUESTION_TYPE_COLORS[type]} flex items-center justify-center text-white text-xs font-medium transition-all`}
                  style={{ width: `${percentage}%` }}
                  title={`${QUESTION_TYPE_LABELS[type]}: ${percentage.toFixed(1)}%`}
                >
                  {percentage >= 10 && `${Math.round(percentage)}%`}
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(localDistribution) as (keyof QuizDistribution)[]).map((type) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${QUESTION_TYPE_COLORS[type]}`} />
                <span className="text-xs text-gray-700">
                  {QUESTION_TYPE_LABELS[type]}: {getQuestionCount(type)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Total and Validation */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Total:</span>
          <span className={`text-sm font-bold ${validationError ? 'text-red-600' : 'text-green-600'}`}>
            {mode === 'percentage' ? `${total}%` : `${total} questions`}
          </span>
        </div>
        
        {validationError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          </div>
        )}
        
        {!validationError && total > 0 && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm text-green-700">Distribution is valid</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
