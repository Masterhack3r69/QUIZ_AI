'use client';

import React from 'react';

export interface QuestionCardProps {
  question: string;
  options: string[];
  selectedAnswer?: number;
  onSelectAnswer: (index: number) => void;
  questionNumber: number;
  totalQuestions: number;
  showCorrectAnswer?: boolean;
  correctAnswer?: number;
}

export function QuestionCard({
  question,
  options,
  selectedAnswer,
  onSelectAnswer,
  questionNumber,
  totalQuestions,
  showCorrectAnswer = false,
  correctAnswer,
}: QuestionCardProps) {
  const getOptionStyles = (index: number) => {
    const baseStyles = 'w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation min-h-[56px]';
    
    // Results page - show correct/incorrect answers
    if (showCorrectAnswer && correctAnswer !== undefined) {
      if (index === correctAnswer) {
        return `${baseStyles} bg-green-50 border-green-500 text-green-900 font-medium`;
      }
      if (index === selectedAnswer && index !== correctAnswer) {
        return `${baseStyles} bg-red-50 border-red-500 text-red-900`;
      }
      return `${baseStyles} bg-gray-50 border-gray-200 text-gray-700`;
    }
    
    // Quiz taking - highlight selected answer
    if (selectedAnswer === index) {
      return `${baseStyles} bg-blue-50 border-blue-500 text-blue-900 font-medium`;
    }
    
    // Default unselected state
    return `${baseStyles} bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100`;
  };

  const getOptionLabel = (index: number) => {
    const labels = ['A', 'B', 'C', 'D'];
    return labels[index] || String.fromCharCode(65 + index);
  };

  const getAnswerStatus = (index: number) => {
    if (!showCorrectAnswer || correctAnswer === undefined) return '';
    if (index === correctAnswer) return 'Correct answer';
    if (index === selectedAnswer) return 'Your incorrect answer';
    return '';
  };

  return (
    <div className="w-full max-w-3xl mx-auto" role="group" aria-labelledby="question-text">
      {/* Question Header */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-500 mb-2" aria-label={`Question ${questionNumber} of ${totalQuestions}`}>
          Question {questionNumber} of {totalQuestions}
        </div>
        <h2 id="question-text" className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
          {question}
        </h2>
      </div>

      {/* Answer Options */}
      <fieldset className="space-y-3">
        <legend className="sr-only">Select your answer</legend>
        {options.map((option, index) => {
          const answerStatus = getAnswerStatus(index);
          return (
            <button
              key={index}
              onClick={() => !showCorrectAnswer && onSelectAnswer(index)}
              disabled={showCorrectAnswer}
              className={getOptionStyles(index)}
              aria-label={`Option ${getOptionLabel(index)}: ${option}${answerStatus ? `. ${answerStatus}` : ''}`}
              aria-pressed={selectedAnswer === index}
              role="radio"
              aria-checked={selectedAnswer === index}
            >
              <div className="flex items-start gap-3">
                {/* Option Label */}
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-semibold text-sm" aria-hidden="true">
                  {getOptionLabel(index)}
                </span>
                
                {/* Option Text */}
                <span className="flex-1 text-base md:text-lg pt-1">
                  {option}
                </span>
                
                {/* Correct/Incorrect Indicator (Results Page) */}
                {showCorrectAnswer && correctAnswer !== undefined && (
                  <>
                    {index === correctAnswer && (
                      <svg
                        className="flex-shrink-0 w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {index === selectedAnswer && index !== correctAnswer && (
                      <svg
                        className="flex-shrink-0 w-6 h-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}
