'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { getQuizStatus } from '@/lib/utils';
import type { Quiz } from '@/types';

interface QuizCardProps {
  quiz: Quiz;
  submissionCount?: number;
  onDelete?: () => void;
}

export function QuizCard({ quiz, submissionCount = 0, onDelete }: QuizCardProps) {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);

  // Determine quiz status based on dates and current status
  const status = getEnhancedQuizStatus(quiz);

  const handleCardClick = () => {
    router.push(`/dashboard/quiz/${quiz._id}`);
  };

  const handleManageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/quiz/${quiz._id}`);
  };

  const handleViewResults = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/quiz/${quiz._id}/results`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/quiz/${quiz._id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  const toggleActions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  // Calculate progress percentage for max students
  const progressPercentage = quiz.maxStudents 
    ? Math.min((submissionCount / quiz.maxStudents) * 100, 100)
    : 0;

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer relative"
      onClick={handleCardClick}
    >
      <div className="p-6">
        {/* Status Badge and Quick Actions Menu */}
        <div className="flex items-center justify-between mb-3">
          <StatusBadge status={status} />
          
          {/* Quick Actions Menu */}
          <div className="relative">
            <button
              onClick={toggleActions}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Quick actions menu"
              aria-expanded={showActions}
            >
              <Icon name="ellipsis-vertical" className="w-5 h-5 text-gray-600" />
            </button>
            
            {showActions && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(false);
                  }}
                />
                
                {/* Actions Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={handleManageClick}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Icon name="eye" className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Icon name="pencil" className="w-4 h-4 mr-2" />
                    Edit Quiz
                  </button>
                  <button
                    onClick={handleViewResults}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Icon name="chart-bar" className="w-4 h-4 mr-2" />
                    View Results
                  </button>
                  {onDelete && (
                    <>
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <Icon name="trash" className="w-4 h-4 mr-2" />
                        Delete Quiz
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quiz Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {quiz.title}
        </h3>

        {/* Subject Tags */}
        {quiz.subjects && quiz.subjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {quiz.subjects.slice(0, 3).map((subject, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
              >
                {subject}
              </span>
            ))}
            {quiz.subjects.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                +{quiz.subjects.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Access Code */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Access Code</p>
          <p className="text-xl font-mono font-bold text-blue-600" aria-label={`Access code: ${quiz.accessCode}`}>
            {quiz.accessCode}
          </p>
        </div>

        {/* Progress Bar for Max Students */}
        {quiz.maxStudents && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Submissions</span>
              <span className="font-medium">
                {submissionCount} / {quiz.maxStudents}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  progressPercentage >= 100
                    ? 'bg-red-500'
                    : progressPercentage >= 75
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={submissionCount}
                aria-valuemin={0}
                aria-valuemax={quiz.maxStudents}
              />
            </div>
          </div>
        )}

        {/* Quiz Info */}
        <dl className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <dt>Questions:</dt>
            <dd className="font-medium text-gray-900">
              {quiz.questions?.length || quiz.questionsPerStudent || 0}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Duration:</dt>
            <dd className="font-medium text-gray-900">
              {quiz.duration} min
            </dd>
          </div>
          {!quiz.maxStudents && (
            <div className="flex items-center justify-between">
              <dt>Submissions:</dt>
              <dd className="font-medium text-gray-900">
                {submissionCount}
              </dd>
            </div>
          )}
          {quiz.startDate && (
            <div className="flex items-center justify-between">
              <dt>Starts:</dt>
              <dd className="font-medium text-gray-900">
                {new Date(quiz.startDate).toLocaleDateString()}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt>Expires:</dt>
            <dd className="font-medium text-gray-900">
              {new Date(quiz.expiresAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            size="sm"
            onClick={handleManageClick}
            className="w-full"
            aria-label={`Manage quiz: ${quiz.title}`}
          >
            Manage Quiz
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Helper component for status badge
function StatusBadge({ status }: { status: Quiz['status'] }) {
  const statusConfig = {
    scheduled: {
      label: 'Scheduled',
      icon: '📅',
      className: 'bg-blue-100 text-blue-800',
    },
    active: {
      label: 'Active',
      icon: '✓',
      className: 'bg-green-100 text-green-800',
    },
    full: {
      label: 'Full',
      icon: '🔒',
      className: 'bg-orange-100 text-orange-800',
    },
    expired: {
      label: 'Expired',
      icon: '⏱',
      className: 'bg-gray-100 text-gray-800',
    },
    draft: {
      label: 'Draft',
      icon: '📝',
      className: 'bg-gray-100 text-gray-600',
    },
  };

  const config = statusConfig[status] || statusConfig.active;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
      role="status"
      aria-label={`Quiz status: ${config.label}`}
    >
      <span aria-hidden="true">
        {config.icon} {config.label}
      </span>
    </span>
  );
}

// Helper function to determine enhanced quiz status
function getEnhancedQuizStatus(quiz: Quiz): Quiz['status'] {
  const now = new Date();
  const expirationDate = new Date(quiz.expiresAt);
  const startDate = quiz.startDate ? new Date(quiz.startDate) : null;

  // Check if expired
  if (expirationDate < now) {
    return 'expired';
  }

  // Check if full
  if (quiz.maxStudents && quiz.submissionCount && quiz.submissionCount >= quiz.maxStudents) {
    return 'full';
  }

  // Check if scheduled (not started yet)
  if (startDate && startDate > now) {
    return 'scheduled';
  }

  // Check database status
  if (quiz.status === 'draft') {
    return 'draft';
  }

  // Default to active
  return 'active';
}
