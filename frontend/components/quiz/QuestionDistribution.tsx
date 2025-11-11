'use client';

import React, { useState, useEffect } from 'react';
import { QuizDistribution } from '@/types';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Choicebox,
  ChoiceboxItem,
  ChoiceboxItemHeader,
  ChoiceboxItemTitle,
  ChoiceboxItemSubtitle,
  ChoiceboxItemContent,
  ChoiceboxItemIndicator,
} from '@/components/ui/shadcn-io/choicebox';

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
  const [selectedPreset, setSelectedPreset] = useState<string>('');

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
    // Clamp value between 0 and max
    const maxValue = getMaxValue();
    const clampedValue = Math.max(0, Math.min(maxValue, value));
    
    const newDistribution = {
      ...localDistribution,
      [type]: clampedValue,
    };
    
    setLocalDistribution(newDistribution);
    
    const error = validateDistribution(newDistribution);
    setValidationError(error);
    
    if (!error) {
      onChange(newDistribution);
    }
  };

  // Handle slider change with auto-adjustment
  const handleSliderChange = (type: keyof QuizDistribution, value: number) => {
    if (mode === 'percentage') {
      // Auto-adjust other values to maintain 100% total
      const currentValue = localDistribution[type];
      const diff = value - currentValue;
      
      if (diff !== 0) {
        const newDistribution = { ...localDistribution, [type]: value };
        const otherTypes = (Object.keys(localDistribution) as (keyof QuizDistribution)[])
          .filter(t => t !== type && localDistribution[t] > 0);
        
        if (otherTypes.length > 0) {
          // Distribute the difference proportionally among other types
          const totalOthers = otherTypes.reduce((sum, t) => sum + localDistribution[t], 0);
          
          if (totalOthers > 0) {
            let remaining = -diff;
            otherTypes.forEach((t, index) => {
              if (index === otherTypes.length - 1) {
                // Last type gets the remaining to avoid rounding errors
                newDistribution[t] = Math.max(0, localDistribution[t] + remaining);
              } else {
                const adjustment = Math.round((localDistribution[t] / totalOthers) * -diff);
                newDistribution[t] = Math.max(0, localDistribution[t] + adjustment);
                remaining -= adjustment;
              }
            });
          }
        }
        
        setLocalDistribution(newDistribution);
        const error = validateDistribution(newDistribution);
        setValidationError(error);
        
        if (!error) {
          onChange(newDistribution);
        }
      }
    } else {
      handleChange(type, value);
    }
  };

  // Apply preset
  const applyPreset = (presetName: string) => {
    const preset = PRESETS.find(p => p.name === presetName);
    if (!preset) return;
    
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
    setSelectedPreset(presetName);
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
    <div className="space-y-6 ">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
         {/* Preset Selection */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Quick Presets</h3>
          <Choicebox value={selectedPreset} onValueChange={applyPreset}>
            <div className="grid grid-cols-1 gap-3">
              {PRESETS.map((preset) => (
                <ChoiceboxItem key={preset.name} value={preset.name}>
                  <ChoiceboxItemHeader>
                    <ChoiceboxItemTitle>
                      {preset.name}
                    </ChoiceboxItemTitle>
                    <ChoiceboxItemSubtitle>
                      {preset.description}
                    </ChoiceboxItemSubtitle>
                  </ChoiceboxItemHeader>
                  <ChoiceboxItemContent>
                    <ChoiceboxItemIndicator />
                  </ChoiceboxItemContent>
                </ChoiceboxItem>
              ))}
            </div>
          </Choicebox>
        </div>

        {/* Distribution Inputs */}
        <div className="col-span-2">
        <h3 className="text-sm font-semibold mb-3">
          Custom Distribution {mode === 'percentage' ? '(%)' : '(Count)'}
        </h3>
        <div className="space-y-4">
          {(Object.keys(localDistribution) as (keyof QuizDistribution)[]).map((type) => (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`dist-${type}`} className="text-sm font-medium">
                  {QUESTION_TYPE_LABELS[type]}
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {localDistribution[type]}{mode === 'percentage' ? '%' : ''}
                  </span>
                  {mode === 'percentage' && (
                    <span className="text-xs text-muted-foreground">
                      ({getQuestionCount(type)} {getQuestionCount(type) === 1 ? 'question' : 'questions'})
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                {/* Slider */}
                <div className="flex-1 flex items-center">
                  <Slider
                    id={`dist-${type}`}
                    min={0}
                    max={getMaxValue()}
                    step={1}
                    value={[localDistribution[type]]}
                    onValueChange={(values) => handleSliderChange(type, values[0])}
                    aria-label={`${QUESTION_TYPE_LABELS[type]} distribution`}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      </div>
     
      {/* Visual Representation - Bar Chart */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Distribution Preview</h3>
        <div className="space-y-3">
          {/* Stacked Bar */}
          <div className="h-8 flex rounded-lg overflow-hidden border-2 border-border">
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
                <span className="text-xs text-muted-foreground">
                  {QUESTION_TYPE_LABELS[type]}: {getQuestionCount(type)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Total and Validation */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total:</span>
          <span className={`text-sm font-bold ${validationError ? 'text-destructive' : 'text-green-600'}`}>
            {mode === 'percentage' ? `${total}%` : `${total} questions`}
          </span>
        </div>
        
        {validationError && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5"
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
              <p className="text-sm text-destructive">{validationError}</p>
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
