'use client';

import React from 'react';

export interface WizardStep {
  id: number;
  title: string;
  description: string;
}

export interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
}

export function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <div className="mb-8">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;
            
            return (
              <li key={step.id} className="flex-1 relative">
                <div className="flex items-center">
                  {/* Step Circle */}
                  <div className="flex items-center justify-center">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                        ${isCompleted ? 'bg-blue-600 text-white' : ''}
                        ${isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : ''}
                        ${isUpcoming ? 'bg-gray-200 text-gray-500' : ''}
                      `}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </div>
                  </div>
                  
                  {/* Step Label */}
                  <div className="ml-3 flex-1">
                    <p
                      className={`
                        text-sm font-medium
                        ${isCurrent ? 'text-blue-600' : ''}
                        ${isCompleted ? 'text-gray-900' : ''}
                        ${isUpcoming ? 'text-gray-500' : ''}
                      `}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        hidden md:block absolute top-5 left-full w-full h-0.5 -ml-5
                        ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}
                      `}
                      style={{ width: 'calc(100% - 2.5rem)' }}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
