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
          >
            {status === 'active' ? '✓ Active' : '⏱ Expired'}
          </span>
        </div>

        {/* Quiz Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {quiz.title}
        </h3>

        {/* Access Code */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Access Code</p>
          <p className="text-xl font-mono font-bold text-blue-600">
            {quiz.accessCode}
          </p>
        </div>

        {/* Quiz Info */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Questions:</span>
            <span className="font-medium text-gray-900">
              {quiz.questions?.length || quiz.questionsPerStudent || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Duration:</span>
            <span className="font-medium text-gray-900">
              {quiz.duration} min
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Submissions:</span>
            <span className="font-medium text-gray-900">
              {submissionCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Expires:</span>
            <span className="font-medium text-gray-900">
              {new Date(quiz.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            size="sm"
            onClick={handleManageClick}
            className="w-full"
          >
            Manage Quiz
          </Button>
        </div>
      </div>
    </Card>
  );
}
