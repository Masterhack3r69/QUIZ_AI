'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, APIRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { QuizListSkeleton } from '@/components/ui/SkeletonLoader';
import { QuizCard } from '@/components/quiz/QuizCard';
import type { Quiz } from '@/types';

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getMyQuizzes();
      setQuizzes(data);
    } catch (err) {
      if (err instanceof APIRequestError) {
        setError(err.message);
      } else {
        setError('Failed to load quizzes. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmissionCount = (quiz: Quiz): number => {
    return quiz.submissionCount || 0;
  };

  return (
    <main id="main-content">
      {/* Header with Create Button */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
            <p className="mt-2 text-gray-600">
              Manage your quizzes and view student results
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/dashboard/create')}
            aria-label="Create new quiz"
          >
            <span role="img" aria-label="Plus">➕</span> Create New Quiz
          </Button>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <Toast
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div role="status" aria-live="polite" aria-label="Loading quizzes">
          <QuizListSkeleton count={6} />
          <span className="sr-only">Loading your quizzes...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && quizzes.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4" role="img" aria-label="Document">📝</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No quizzes yet
          </h2>
          <p className="text-gray-600 mb-6">
            Get started by creating your first AI-powered quiz
          </p>
          <Button
            variant="primary"
            onClick={() => router.push('/dashboard/create')}
            aria-label="Create your first quiz"
          >
            Create Your First Quiz
          </Button>
        </Card>
      )}

      {/* Quiz Grid */}
      {!isLoading && quizzes.length > 0 && (
        <section aria-label="Your quizzes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                submissionCount={getSubmissionCount(quiz)}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
