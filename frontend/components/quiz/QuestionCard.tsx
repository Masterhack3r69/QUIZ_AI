'use client';

import React, { useState } from 'react';
import type { Question, QuestionType } from '@/types';

export interface QuestionCardProps {
  question: Question;
  selectedAnswer?: number | boolean | string | { left: number; right: number }[];
  onSelectAnswer: (answer: number | boolean | string | { left: number; right: number }[]) => void;
  questionNumber: number;
  totalQuestions: number;
  showCorrectAnswer?: boolean;
  isReview?: boolean;
}

export function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  questionNumber,
  totalQuestions,
  showCorrectAnswer = false,
  isReview = false,
}: QuestionCardProps) {
  // State for matching question pairs
  const [matchingPairs, setMatchingPairs] = useState<{ left: number; right: number }[]>(
    Array.isArray(selectedAnswer) ? selectedAnswer : []
  );

  const getQuestionTypeBadge = () => {
    const badges = {
      multipleChoice: { label: 'Multiple Choice', color: 'bg-blue-100 text-blue-800' },
      trueFalse: { label: 'True or False', color: 'bg-purple-100 text-purple-800' },
      fillInBlank: { label: 'Fill in the Blank', color: 'bg-green-100 text-green-800' },
      matching: { label: 'Matching', color: 'bg-orange-100 text-orange-800' },
    };

    const badge = badges[question.type];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const renderMultipleChoice = () => {
    if (question.type !== 'multipleChoice') return null;

    const getOptionStyles = (index: number) => {
      const baseStyles = 'w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation min-h-[56px]';
      
      if (showCorrectAnswer) {
        if (index === question.correctAnswer) {
          return `${baseStyles} bg-green-50 border-green-500 text-green-900 font-medium`;
        }
        if (index === selectedAnswer && index !== question.correctAnswer) {
          return `${baseStyles} bg-red-50 border-red-500 text-red-900`;
        }
        return `${baseStyles} bg-gray-50 border-gray-200 text-gray-700`;
      }
      
      if (selectedAnswer === index) {
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-900 font-medium`;
      }
      
      return `${baseStyles} bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100`;
    };

    const getOptionLabel = (index: number) => {
      const labels = ['A', 'B', 'C', 'D'];
      return labels[index] || String.fromCharCode(65 + index);
    };

    return (
      <fieldset className="space-y-3">
        <legend className="sr-only">Select your answer</legend>
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !showCorrectAnswer && onSelectAnswer(index)}
            disabled={showCorrectAnswer}
            className={getOptionStyles(index)}
            aria-label={`Option ${getOptionLabel(index)}: ${option}`}
            role="radio"
            aria-checked={selectedAnswer === index}
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-semibold text-sm" aria-hidden="true">
                {getOptionLabel(index)}
              </span>
              <span className="flex-1 text-base md:text-lg pt-1">
                {option}
              </span>
              {showCorrectAnswer && (
                <>
                  {index === question.correctAnswer && (
                    <svg className="flex-shrink-0 w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {index === selectedAnswer && index !== question.correctAnswer && (
                    <svg className="flex-shrink-0 w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </>
              )}
            </div>
          </button>
        ))}
      </fieldset>
    );
  };

  const renderTrueFalse = () => {
    if (question.type !== 'trueFalse') return null;

    const getButtonStyles = (value: boolean) => {
      const baseStyles = 'flex-1 p-4 sm:p-6 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation min-h-[80px] font-semibold text-lg';
      
      if (showCorrectAnswer) {
        if (value === question.correctAnswer) {
          return `${baseStyles} bg-green-50 border-green-500 text-green-900`;
        }
        if (value === selectedAnswer && value !== question.correctAnswer) {
          return `${baseStyles} bg-red-50 border-red-500 text-red-900`;
        }
        return `${baseStyles} bg-gray-50 border-gray-200 text-gray-700`;
      }
      
      if (selectedAnswer === value) {
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-900`;
      }
      
      return `${baseStyles} bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100`;
    };

    return (
      <div className="flex gap-4">
        <button
          onClick={() => !showCorrectAnswer && onSelectAnswer(true)}
          disabled={showCorrectAnswer}
          className={getButtonStyles(true)}
          aria-label="True"
          role="radio"
          aria-checked={selectedAnswer === true}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>True</span>
            {showCorrectAnswer && true === question.correctAnswer && (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>
        <button
          onClick={() => !showCorrectAnswer && onSelectAnswer(false)}
          disabled={showCorrectAnswer}
          className={getButtonStyles(false)}
          aria-label="False"
          role="radio"
          aria-checked={selectedAnswer === false}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">✗</span>
            <span>False</span>
            {showCorrectAnswer && false === question.correctAnswer && (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>
      </div>
    );
  };

  const renderFillInBlank = () => {
    if (question.type !== 'fillInBlank') return null;

    const isCorrect = showCorrectAnswer && 
      typeof selectedAnswer === 'string' && 
      selectedAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase();

    const inputStyles = showCorrectAnswer
      ? isCorrect
        ? 'border-green-500 bg-green-50'
        : 'border-red-500 bg-red-50'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    return (
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
            onChange={(e) => !showCorrectAnswer && onSelectAnswer(e.target.value)}
            disabled={showCorrectAnswer}
            placeholder="Type your answer here..."
            className={`w-full p-4 text-lg rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${inputStyles}`}
            aria-label="Fill in the blank answer"
          />
          {showCorrectAnswer && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isCorrect ? (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          )}
        </div>
        {showCorrectAnswer && !isCorrect && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Correct answer:</span> {question.correctAnswer}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderMatching = () => {
    if (question.type !== 'matching') return null;

    const handlePairChange = (leftIndex: number, rightIndex: number) => {
      const newPairs = matchingPairs.filter(p => p.left !== leftIndex);
      if (rightIndex !== -1) {
        newPairs.push({ left: leftIndex, right: rightIndex });
      }
      setMatchingPairs(newPairs);
      onSelectAnswer(newPairs);
    };

    const getSelectedRight = (leftIndex: number) => {
      const pair = matchingPairs.find(p => p.left === leftIndex);
      return pair ? pair.right : -1;
    };

    const isPairCorrect = (leftIndex: number, rightIndex: number) => {
      return question.correctPairs.some(cp => cp.left === leftIndex && cp.right === rightIndex);
    };

    const allPaired = matchingPairs.length === question.leftColumn.length;

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Match each item on the left with the correct item on the right:</p>
        <div className="space-y-3">
          {question.leftColumn.map((leftItem, leftIndex) => {
            const selectedRight = getSelectedRight(leftIndex);
            const isCorrect = showCorrectAnswer && selectedRight !== -1 && isPairCorrect(leftIndex, selectedRight);
            const isIncorrect = showCorrectAnswer && selectedRight !== -1 && !isPairCorrect(leftIndex, selectedRight);

            return (
              <div key={leftIndex} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <span className="text-base font-medium">{leftItem}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">→</span>
                  <select
                    value={selectedRight}
                    onChange={(e) => !showCorrectAnswer && handlePairChange(leftIndex, parseInt(e.target.value))}
                    disabled={showCorrectAnswer}
                    className={`flex-1 sm:w-64 p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isCorrect ? 'border-green-500 bg-green-50' :
                      isIncorrect ? 'border-red-500 bg-red-50' :
                      'border-gray-300 bg-white'
                    }`}
                    aria-label={`Match for ${leftItem}`}
                  >
                    <option value={-1}>Select a match...</option>
                    {question.rightColumn.map((rightItem, rightIndex) => (
                      <option key={rightIndex} value={rightIndex}>
                        {rightItem}
                      </option>
                    ))}
                  </select>
                  {showCorrectAnswer && selectedRight !== -1 && (
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {!showCorrectAnswer && !allPaired && (
          <p className="text-sm text-amber-600">
            Please match all items before proceeding.
          </p>
        )}
        {showCorrectAnswer && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">Correct pairs:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              {question.correctPairs.map((pair, idx) => (
                <li key={idx}>
                  {question.leftColumn[pair.left]} → {question.rightColumn[pair.right]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto" role="group" aria-labelledby="question-text">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-500" aria-label={`Question ${questionNumber} of ${totalQuestions}`}>
            Question {questionNumber} of {totalQuestions}
          </div>
          {getQuestionTypeBadge()}
        </div>
        <h2 id="question-text" className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Question Type Specific Rendering */}
      <div className="mt-6">
        {question.type === 'multipleChoice' && renderMultipleChoice()}
        {question.type === 'trueFalse' && renderTrueFalse()}
        {question.type === 'fillInBlank' && renderFillInBlank()}
        {question.type === 'matching' && renderMatching()}
      </div>
    </div>
  );
}
