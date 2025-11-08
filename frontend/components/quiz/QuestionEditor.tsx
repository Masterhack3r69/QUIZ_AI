'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/Icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Question, MultipleChoiceQuestion, TrueFalseQuestion, FillInBlankQuestion, MatchingQuestion } from '@/types';

export interface QuestionEditorProps {
  question: Question;
  questionNumber: number;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function QuestionEditor({
  question,
  questionNumber,
  onSave,
  onCancel,
  onDelete,
}: QuestionEditorProps) {
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const validateQuestion = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate question text
    if (!editedQuestion.question.trim()) {
      newErrors.question = 'Question text is required';
    }

    // Type-specific validation
    if (editedQuestion.type === 'multipleChoice') {
      const mcQuestion = editedQuestion as MultipleChoiceQuestion;
      if (mcQuestion.options.some((opt) => !opt.trim())) {
        newErrors.options = 'All options must be filled';
      }
      if (mcQuestion.correctAnswer < 0 || mcQuestion.correctAnswer >= mcQuestion.options.length) {
        newErrors.correctAnswer = 'Please select a correct answer';
      }
    } else if (editedQuestion.type === 'fillInBlank') {
      const fibQuestion = editedQuestion as FillInBlankQuestion;
      if (!fibQuestion.correctAnswer.trim()) {
        newErrors.correctAnswer = 'Correct answer is required';
      }
    } else if (editedQuestion.type === 'matching') {
      const matchQuestion = editedQuestion as MatchingQuestion;
      if (matchQuestion.leftColumn.some((item) => !item.trim())) {
        newErrors.leftColumn = 'All left column items must be filled';
      }
      if (matchQuestion.rightColumn.some((item) => !item.trim())) {
        newErrors.rightColumn = 'All right column items must be filled';
      }
      if (matchQuestion.correctPairs.length !== matchQuestion.leftColumn.length) {
        newErrors.correctPairs = 'All items must be paired';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateQuestion()) {
      onSave(editedQuestion);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  const renderMultipleChoiceEditor = () => {
    const mcQuestion = editedQuestion as MultipleChoiceQuestion;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question-text">Question *</Label>
          <Input
            id="question-text"
            type="text"
            value={mcQuestion.question}
            onChange={(e) =>
              setEditedQuestion({ ...mcQuestion, question: e.target.value })
            }
            required
          />
          {errors.question && (
            <p className="text-sm text-red-600">{errors.question}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          <div className="space-y-3">
            {mcQuestion.options.map((option, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={mcQuestion.correctAnswer === index}
                    onChange={() =>
                      setEditedQuestion({ ...mcQuestion, correctAnswer: index })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`option-${index}`}>Option {String.fromCharCode(65 + index)} *</Label>
                  <Input
                    id={`option-${index}`}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...mcQuestion.options];
                      newOptions[index] = e.target.value;
                      setEditedQuestion({ ...mcQuestion, options: newOptions });
                    }}
                    required
                  />
                </div>
              </div>
            ))}
          </div>
          {errors.options && (
            <p className="mt-2 text-sm text-red-600">{errors.options}</p>
          )}
          {errors.correctAnswer && (
            <p className="mt-2 text-sm text-red-600">{errors.correctAnswer}</p>
          )}
        </div>
      </div>
    );
  };

  const renderTrueFalseEditor = () => {
    const tfQuestion = editedQuestion as TrueFalseQuestion;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tf-question">Question Statement *</Label>
          <Input
            id="tf-question"
            type="text"
            value={tfQuestion.question}
            onChange={(e) =>
              setEditedQuestion({ ...tfQuestion, question: e.target.value })
            }
            required
          />
          {errors.question && (
            <p className="text-sm text-red-600">{errors.question}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correct Answer
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() =>
                setEditedQuestion({ ...tfQuestion, correctAnswer: true })
              }
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                tfQuestion.correctAnswer
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
              }`}
            >
              True
            </button>
            <button
              type="button"
              onClick={() =>
                setEditedQuestion({ ...tfQuestion, correctAnswer: false })
              }
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                !tfQuestion.correctAnswer
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-red-500'
              }`}
            >
              False
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFillInBlankEditor = () => {
    const fibQuestion = editedQuestion as FillInBlankQuestion;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fib-question">Question (use _____ to indicate the blank) *</Label>
          <Input
            id="fib-question"
            type="text"
            value={fibQuestion.question}
            onChange={(e) =>
              setEditedQuestion({ ...fibQuestion, question: e.target.value })
            }
            required
          />
          <p className="text-sm text-gray-500">Example: The capital of France is _____</p>
          {errors.question && (
            <p className="text-sm text-red-600">{errors.question}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fib-answer">Correct Answer *</Label>
          <Input
            id="fib-answer"
            type="text"
            value={fibQuestion.correctAnswer}
            onChange={(e) =>
              setEditedQuestion({ ...fibQuestion, correctAnswer: e.target.value })
            }
            required
          />
          {errors.correctAnswer && (
            <p className="text-sm text-red-600">{errors.correctAnswer}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="caseSensitive"
            checked={fibQuestion.caseSensitive || false}
            onChange={(e) =>
              setEditedQuestion({
                ...fibQuestion,
                caseSensitive: e.target.checked,
              })
            }
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label htmlFor="caseSensitive" className="text-sm text-gray-700">
            Case sensitive
          </label>
        </div>
      </div>
    );
  };

  const renderMatchingEditor = () => {
    const matchQuestion = editedQuestion as MatchingQuestion;

    const handleLeftColumnChange = (index: number, value: string) => {
      const newLeftColumn = [...matchQuestion.leftColumn];
      newLeftColumn[index] = value;
      setEditedQuestion({ ...matchQuestion, leftColumn: newLeftColumn });
    };

    const handleRightColumnChange = (index: number, value: string) => {
      const newRightColumn = [...matchQuestion.rightColumn];
      newRightColumn[index] = value;
      setEditedQuestion({ ...matchQuestion, rightColumn: newRightColumn });
    };

    const handlePairChange = (leftIndex: number, rightIndex: number) => {
      const newPairs = [...matchQuestion.correctPairs];
      const existingPairIndex = newPairs.findIndex((p) => p.left === leftIndex);
      
      if (existingPairIndex >= 0) {
        newPairs[existingPairIndex] = { left: leftIndex, right: rightIndex };
      } else {
        newPairs.push({ left: leftIndex, right: rightIndex });
      }
      
      setEditedQuestion({ ...matchQuestion, correctPairs: newPairs });
    };

    const getPairForLeft = (leftIndex: number): number => {
      const pair = matchQuestion.correctPairs.find((p) => p.left === leftIndex);
      return pair ? pair.right : -1;
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="match-question">Question *</Label>
          <Input
            id="match-question"
            type="text"
            value={matchQuestion.question}
            onChange={(e) =>
              setEditedQuestion({ ...matchQuestion, question: e.target.value })
            }
            required
          />
          {errors.question && (
            <p className="text-sm text-red-600">{errors.question}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Left Column
            </label>
            <div className="space-y-3">
              {matchQuestion.leftColumn.map((item, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`left-${index}`}>Item {index + 1} *</Label>
                  <Input
                    id={`left-${index}`}
                    type="text"
                    value={item}
                    onChange={(e) => handleLeftColumnChange(index, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
            {errors.leftColumn && (
              <p className="mt-2 text-sm text-red-600">{errors.leftColumn}</p>
            )}
          </div>

          {/* Right Column */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Right Column
            </label>
            <div className="space-y-3">
              {matchQuestion.rightColumn.map((item, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`right-${index}`}>Item {index + 1} *</Label>
                  <Input
                    id={`right-${index}`}
                    type="text"
                    value={item}
                    onChange={(e) => handleRightColumnChange(index, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
            {errors.rightColumn && (
              <p className="mt-2 text-sm text-red-600">{errors.rightColumn}</p>
            )}
          </div>
        </div>

        {/* Pairing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correct Pairings
          </label>
          <div className="space-y-2">
            {matchQuestion.leftColumn.map((leftItem, leftIndex) => (
              <div key={leftIndex} className="flex items-center gap-3">
                <div className="flex-1 text-sm text-gray-700 truncate">
                  {leftItem || `Item ${leftIndex + 1}`}
                </div>
                <Icon name="arrow-right" className="text-gray-400" />
                <select
                  value={getPairForLeft(leftIndex)}
                  onChange={(e) =>
                    handlePairChange(leftIndex, parseInt(e.target.value))
                  }
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={-1}>Select match...</option>
                  {matchQuestion.rightColumn.map((rightItem, rightIndex) => (
                    <option key={rightIndex} value={rightIndex}>
                      {rightItem || `Item ${rightIndex + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {errors.correctPairs && (
            <p className="mt-2 text-sm text-red-600">{errors.correctPairs}</p>
          )}
        </div>
      </div>
    );
  };

  const renderEditor = () => {
    switch (editedQuestion.type) {
      case 'multipleChoice':
        return renderMultipleChoiceEditor();
      case 'trueFalse':
        return renderTrueFalseEditor();
      case 'fillInBlank':
        return renderFillInBlankEditor();
      case 'matching':
        return renderMatchingEditor();
      default:
        return <div>Unsupported question type</div>;
    }
  };

  const getQuestionTypeLabel = () => {
    switch (editedQuestion.type) {
      case 'multipleChoice':
        return 'Multiple Choice';
      case 'trueFalse':
        return 'True/False';
      case 'fillInBlank':
        return 'Fill-in-the-Blank';
      case 'matching':
        return 'Matching';
      default:
        return 'Unknown';
    }
  };

  const renderMultipleChoicePreview = () => {
    const mcQuestion = editedQuestion as MultipleChoiceQuestion;
    return (
      <div className="space-y-3">
        {mcQuestion.options.map((option, index) => (
          <div
            key={index}
            className="w-full text-left p-4 rounded-lg border-2 bg-white border-gray-300 text-gray-900"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 text-base pt-1">
                {option || `Option ${String.fromCharCode(65 + index)}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTrueFalsePreview = () => {
    return (
      <div className="flex gap-4">
        <div className="flex-1 py-4 px-6 rounded-lg border-2 bg-white border-gray-300 text-gray-900 text-center font-medium">
          True
        </div>
        <div className="flex-1 py-4 px-6 rounded-lg border-2 bg-white border-gray-300 text-gray-900 text-center font-medium">
          False
        </div>
      </div>
    );
  };

  const renderFillInBlankPreview = () => {
    return (
      <div>
        <input
          type="text"
          placeholder="Type your answer here..."
          disabled
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900"
        />
        {(editedQuestion as FillInBlankQuestion).caseSensitive && (
          <p className="mt-2 text-sm text-gray-600">
            <Icon name="info" className="inline w-4 h-4 mr-1" />
            This answer is case-sensitive
          </p>
        )}
      </div>
    );
  };

  const renderMatchingPreview = () => {
    const matchQuestion = editedQuestion as MatchingQuestion;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Match these items:</h4>
          <div className="space-y-2">
            {matchQuestion.leftColumn.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border-2 bg-white border-gray-300 text-gray-900"
              >
                {item || `Item ${index + 1}`}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">With these items:</h4>
          <div className="space-y-2">
            {matchQuestion.rightColumn.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border-2 bg-white border-gray-300 text-gray-900"
              >
                {item || `Item ${index + 1}`}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Question {questionNumber}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
            {editedQuestion.question || 'Question text will appear here...'}
          </h3>
        </div>
        
        {editedQuestion.type === 'multipleChoice' && renderMultipleChoicePreview()}
        {editedQuestion.type === 'trueFalse' && renderTrueFalsePreview()}
        {editedQuestion.type === 'fillInBlank' && renderFillInBlankPreview()}
        {editedQuestion.type === 'matching' && renderMatchingPreview()}
        
        <div className="mt-6 pt-4 border-t border-gray-300">
          <p className="text-sm text-gray-600 italic">
            This is how students will see this question during the quiz.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
            {questionNumber}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Question
            </h3>
            <p className="text-sm text-gray-600">{getQuestionTypeLabel()}</p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Icon name="trash" className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>

      {/* Tabs for Edit and Preview */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="mt-6">
          {renderEditor()}
        </TabsContent>
        <TabsContent value="preview" className="mt-6">
          {renderPreview()}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="default" onClick={handleSave}>
          <Icon name="check" className="w-4 h-4 mr-1" />
          Save Changes
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="alert" className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Delete Question?
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete this question? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Question
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
