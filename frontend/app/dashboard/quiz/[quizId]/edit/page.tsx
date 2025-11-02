'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient, APIRequestError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { QuestionEditor } from '@/components/quiz/QuestionEditor';
import type { Quiz, Question } from '@/types';

export default function EditQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const { showError, showSuccess, showInfo } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getQuiz(quizId);
      setQuiz(data);
      setQuestions(data.questions || []);
    } catch (err) {
      if (err instanceof APIRequestError) {
        setError(err.message);
        showError(err.message);
      } else {
        setError('Failed to load quiz. Please try again.');
        showError('Failed to load quiz. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuestion = (updatedQuestion: Question) => {
    // Update the question in the local state
    setQuestions((prev) =>
      prev.map((q) => (q._id === updatedQuestion._id ? updatedQuestion : q))
    );
    setEditingQuestionId(null);
    setHasUnsavedChanges(true);
    showInfo('Question updated. Remember to save all changes!');
  };

  const handleDeleteQuestion = (questionId: string) => {
    // Remove the question from local state
    setQuestions((prev) => prev.filter((q) => q._id !== questionId));
    setEditingQuestionId(null);
    setHasUnsavedChanges(true);
    showInfo('Question deleted. Remember to save all changes!');
  };

  const handleSaveAllChanges = async () => {
    try {
      setIsSaving(true);

      // Update quiz with new questions
      const updatedQuiz = await apiClient.updateQuizQuestions(quizId, questions);
      
      setQuiz(updatedQuiz);
      setQuestions(updatedQuiz.questions || []);
      setHasUnsavedChanges(false);
      showSuccess('All changes saved successfully!');
    } catch (err) {
      if (err instanceof APIRequestError) {
        showError(err.message);
      } else {
        showError('Failed to save changes. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) return;
    }
    router.push(`/dashboard/quiz/${quizId}`);
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
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

  const getQuestionTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'multipleChoice':
        return 'bg-purple-100 text-purple-800';
      case 'trueFalse':
        return 'bg-green-100 text-green-800';
      case 'fillInBlank':
        return 'bg-amber-100 text-amber-800';
      case 'matching':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <SkeletonLoader variant="card" count={3} />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <div className="flex justify-center mb-4">
            <Icon name="warning" className="w-16 h-16 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Quiz
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Quiz Management
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Questions</h1>
            <p className="text-gray-600 mt-1">{quiz.title}</p>
          </div>

          {hasUnsavedChanges && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-amber-600 font-medium">
                <Icon name="warning" className="inline w-4 h-4 mr-1" />
                Unsaved changes
              </span>
              <Button
                variant="primary"
                onClick={handleSaveAllChanges}
                loading={isSaving}
              >
                <Icon name="check" className="mr-2" />
                Save All Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Question Count Summary */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Question Summary
              </h3>
              <p className="text-gray-600">
                Total: {questions.length} questions
              </p>
            </div>
            <div className="flex gap-2">
              {quiz.questionDistribution.multipleChoice > 0 && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  MC: {questions.filter((q) => q.type === 'multipleChoice').length}
                </span>
              )}
              {quiz.questionDistribution.trueFalse > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  T/F: {questions.filter((q) => q.type === 'trueFalse').length}
                </span>
              )}
              {quiz.questionDistribution.fillInBlank > 0 && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  FIB: {questions.filter((q) => q.type === 'fillInBlank').length}
                </span>
              )}
              {quiz.questionDistribution.matching > 0 && (
                <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                  Match: {questions.filter((q) => q.type === 'matching').length}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.length === 0 ? (
          <Card className="text-center py-12">
            <Icon name="info" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Questions
            </h3>
            <p className="text-gray-600">
              This quiz doesn't have any questions yet.
            </p>
          </Card>
        ) : (
          questions.map((question, index) => (
            <div key={question._id}>
              {editingQuestionId === question._id ? (
                <QuestionEditor
                  question={question}
                  questionNumber={index + 1}
                  onSave={handleSaveQuestion}
                  onCancel={() => setEditingQuestionId(null)}
                  onDelete={() => handleDeleteQuestion(question._id)}
                />
              ) : (
                <Card className="hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getQuestionTypeBadgeColor(
                              question.type
                            )}`}
                          >
                            {getQuestionTypeLabel(question.type)}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {question.question}
                        </h3>
                        {question.type === 'multipleChoice' && (
                          <p className="text-sm text-gray-600">
                            {(question as any).options?.length || 0} options
                          </p>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingQuestionId(question._id)}
                      >
                        <Icon name="edit" className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Actions */}
      {questions.length > 0 && (
        <div className="mt-8 flex justify-between items-center p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSaveAllChanges}
            loading={isSaving}
            disabled={!hasUnsavedChanges}
          >
            <Icon name="check" className="mr-2" />
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  );
}
