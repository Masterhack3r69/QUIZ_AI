'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient, APIRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { getQuizStatus } from '@/lib/utils';
import type { Quiz } from '@/types';

interface EditFormData {
  title: string;
  duration: number;
  expiresAt: string;
}

interface EditFormErrors {
  title?: string;
  duration?: string;
  expiresAt?: string;
}

export default function QuizManagementPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: '',
    duration: 0,
    expiresAt: '',
  });
  const [editFormErrors, setEditFormErrors] = useState<EditFormErrors>({});

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getQuiz(quizId);
      setQuiz(data);
    } catch (err) {
      if (err instanceof APIRequestError) {
        setError(err.message);
      } else {
        setError('Failed to load quiz. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };



  const handleCopyAccessCode = async () => {
    if (!quiz) return;
    
    try {
      await navigator.clipboard.writeText(quiz.accessCode);
      setSuccessMessage('Access code copied to clipboard!');
    } catch (err) {
      setError('Failed to copy access code');
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      setIsDeleting(true);
      await apiClient.deleteQuiz(quizId);
      setSuccessMessage('Quiz deleted successfully');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      if (err instanceof APIRequestError) {
        setError(err.message);
      } else {
        setError('Failed to delete quiz. Please try again.');
      }
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleViewResults = () => {
    router.push(`/dashboard/quiz/${quizId}/results`);
  };

  const handleEditSettings = () => {
    if (!quiz) return;
    
    // Pre-populate form with current quiz values
    // Convert expiresAt to datetime-local format (YYYY-MM-DDTHH:mm)
    const expiresAtDate = new Date(quiz.expiresAt);
    const localDateTime = new Date(expiresAtDate.getTime() - expiresAtDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    setEditFormData({
      title: quiz.title,
      duration: quiz.duration,
      expiresAt: localDateTime,
    });
    setEditFormErrors({});
    setShowEditModal(true);
  };

  const validateEditForm = (): boolean => {
    const errors: EditFormErrors = {};
    
    // Validate title
    if (!editFormData.title.trim()) {
      errors.title = 'Title is required';
    } else if (editFormData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    // Validate duration
    if (!editFormData.duration || editFormData.duration <= 0) {
      errors.duration = 'Duration must be greater than 0';
    } else if (editFormData.duration > 300) {
      errors.duration = 'Duration cannot exceed 300 minutes';
    }
    
    // Validate expiration date
    if (!editFormData.expiresAt) {
      errors.expiresAt = 'Expiration date is required';
    } else {
      const expiresAt = new Date(editFormData.expiresAt);
      const now = new Date();
      if (expiresAt <= now) {
        errors.expiresAt = 'Expiration date must be in the future';
      }
    }
    
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateQuiz = async () => {
    if (!validateEditForm()) {
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // Convert datetime-local back to ISO string
      const expiresAt = new Date(editFormData.expiresAt).toISOString();
      
      const updatedQuiz = await apiClient.updateQuiz(quizId, {
        title: editFormData.title.trim(),
        duration: editFormData.duration,
        expiresAt,
      });
      
      // Update local state with new quiz data
      setQuiz(updatedQuiz);
      setShowEditModal(false);
      setSuccessMessage('Quiz settings updated successfully!');
    } catch (err) {
      if (err instanceof APIRequestError) {
        setError(err.message);
      } else {
        setError('Failed to update quiz. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditFormChange = (field: keyof EditFormData, value: string | number) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (editFormErrors[field]) {
      setEditFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <SkeletonLoader variant="card" count={2} />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
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

  const status = quiz ? getQuizStatus(quiz.expiresAt, quiz.status) : 'expired';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Toast */}
      {successMessage && (
        <Toast
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Error Toast */}
      {error && (
        <Toast
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard')}
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
          Back to Dashboard
        </button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
          
          {/* Status Badge */}
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {status === 'active' ? '✓ Active' : '⏱ Expired'}
          </span>
        </div>
      </div>

      {/* Quiz Details Card */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {quiz.title}
          </h2>

          {/* Access Code Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Access Code
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white px-4 py-3 rounded-lg border border-gray-300">
                <p className="text-3xl font-mono font-bold text-blue-600 text-center tracking-wider">
                  {quiz.accessCode}
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleCopyAccessCode}
                className="whitespace-nowrap"
              >
                📋 Copy Code
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Share this code with students to access the quiz
            </p>
          </div>

          {/* Quiz Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <p className="text-lg text-gray-900">
                {quiz.duration} minutes
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Questions per Student
              </label>
              <p className="text-lg text-gray-900">
                {quiz.questionsPerStudent} questions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Questions in Pool
              </label>
              <p className="text-lg text-gray-900">
                {quiz.questions?.length || 0} questions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <p className="text-lg text-gray-900">
                {new Date(quiz.expiresAt).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created
              </label>
              <p className="text-lg text-gray-900">
                {new Date(quiz.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <p className="text-lg text-gray-900">
                {new Date(quiz.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleViewResults}
          className="w-full"
        >
          📊 View Results
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={handleEditSettings}
          className="w-full"
        >
          ✏️ Edit Settings
        </Button>

        <Button
          variant="danger"
          size="lg"
          onClick={() => setShowDeleteModal(true)}
          className="w-full"
        >
          🗑️ Delete Quiz
        </Button>
      </div>

      {/* Edit Settings Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => !isUpdating && setShowEditModal(false)}
        title="Edit Quiz Settings"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateQuiz}
              loading={isUpdating}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Quiz Title"
            type="text"
            value={editFormData.title}
            onChange={(e) => handleEditFormChange('title', e.target.value)}
            error={editFormErrors.title}
            required
            disabled={isUpdating}
            placeholder="Enter quiz title"
            showValidIndicator={true}
          />
          
          <Input
            label="Duration (minutes)"
            type="number"
            value={editFormData.duration.toString()}
            onChange={(e) => handleEditFormChange('duration', parseInt(e.target.value) || 0)}
            error={editFormErrors.duration}
            required
            disabled={isUpdating}
            min="1"
            max="300"
            placeholder="e.g., 30"
            showValidIndicator={true}
          />
          
          <Input
            label="Expiration Date & Time"
            type="datetime-local"
            value={editFormData.expiresAt}
            onChange={(e) => handleEditFormChange('expiresAt', e.target.value)}
            error={editFormErrors.expiresAt}
            required
            disabled={isUpdating}
            showValidIndicator={true}
          />
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Note: The access code and questions will remain unchanged.
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Quiz"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteQuiz}
              loading={isDeleting}
            >
              Delete Quiz
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{quiz.title}</strong>?
          </p>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Warning: This action cannot be undone
            </p>
            <p className="text-sm text-red-700 mt-2">
              All quiz data and student submissions will be permanently deleted.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
