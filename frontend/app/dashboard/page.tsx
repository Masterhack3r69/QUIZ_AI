'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileQuestion } from 'lucide-react';
import { apiClient, APIRequestError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { QuizCard } from '@/components/quiz/QuizCard';
import { CardLoadingSkeleton } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import type { Quiz } from '@/types';

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showError } = useToast();

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
      let errorMessage = 'Failed to load quizzes. Please try again.';
      if (err instanceof APIRequestError) {
        errorMessage = err.message;
        showError(err.message);
      } else {
        showError(errorMessage);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmissionCount = (quiz: Quiz): number => {
    return quiz.submissionCount || 0;
  };

  // Sort quizzes by creation date (newest first)
  const filteredAndSortedQuizzes = useMemo(() => {
    return [...quizzes].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [quizzes]);

  return (
    <>
      {/* Page Header with Create Button */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Quizzes</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your quizzes and view student results
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => router.push('/dashboard/create')}
            aria-label="Create new quiz"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </div>
      </div>

      {/* Error State */}
      {!isLoading && error && (
        <ErrorAlert
          title="Failed to Load Quizzes"
          message={error}
          onRetry={loadQuizzes}
          retryLabel="Retry"
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div role="status" aria-live="polite" aria-label="Loading quizzes">
          <CardLoadingSkeleton count={6} />
          <span className="sr-only">Loading your quizzes...</span>
        </div>
      )}

      {/* Empty State - No Quizzes */}
      {!isLoading && !error && quizzes.length === 0 && (
        <EmptyState
          icon={FileQuestion}
          title="No quizzes yet"
          description="Get started by creating your first AI-powered quiz from your learning materials"
          actionLabel="Create Your First Quiz"
          actionIcon={Plus}
          onAction={() => router.push('/dashboard/create')}
        />
      )}

      {/* Quiz Grid */}
      {!isLoading && !error && filteredAndSortedQuizzes.length > 0 && (
        <section aria-label="Your quizzes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedQuizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                submissionCount={getSubmissionCount(quiz)}
                onDelete={() => loadQuizzes()}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
