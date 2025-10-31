'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getQuizStatus } from '@/lib/utils';
import type { Quiz } from '@/types';

interface QuizCardProps {
  quiz: Quiz;
  submissionCount?: number;
}

export function QuizCard({ quiz, submissionCount = 0 }: QuizCardProps) {
  const router = useRouter();

  // Determine quiz status based on expiration date and current status
  const status = getQuizStatus(quiz.expiresAt, quiz.status);

  const handleCardClick = () => {
    router.push(`/dashboard/quiz/${quiz._id}`);
  };

  const handleManageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/quiz/${quiz._id}`);
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
            role="status"
            aria-label={`Quiz status: ${status}`}
          >
            <span aria-hidden="true">{status === 'active' ? '✓ Active' : '⏱ Expired'}</span>
          </span>
        </div>

        {/* Quiz Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {quiz.title}
        </h3>

        {/* Access Code */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Access Code</p>
          <p className="text-xl font-mono font-bold text-blue-600" aria-label={`Access code: ${quiz.accessCode}`}>
            {quiz.accessCode}
          </p>
        </div>

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
          <div className="flex items-center justify-between">
            <dt>Submissions:</dt>
            <dd className="font-medium text-gray-900">
              {submissionCount}
            </dd>
          </div>
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
