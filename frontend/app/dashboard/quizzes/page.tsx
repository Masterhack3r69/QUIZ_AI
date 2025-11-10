'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileQuestion, Filter } from 'lucide-react';
import { apiClient, APIRequestError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { QuizCard } from '@/components/quiz/QuizCard';
import { CardLoadingSkeleton } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import type { Quiz } from '@/types';

type FilterStatus = 'all' | 'active' | 'expired' | 'scheduled' | 'draft';

export default function AllQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
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

  const getQuizStatus = (quiz: Quiz): Quiz['status'] => {
    const now = new Date();
    const expirationDate = new Date(quiz.expiresAt);
    const startDate = quiz.startDate ? new Date(quiz.startDate) : null;

    if (expirationDate < now) return 'expired';
    if (quiz.maxStudents && quiz.submissionCount && quiz.submissionCount >= quiz.maxStudents) return 'full';
    if (startDate && startDate > now) return 'scheduled';
    if (quiz.status === 'draft') return 'draft';
    return 'active';
  };

  // Filter and sort quizzes
  const filteredQuizzes = useMemo(() => {
    let filtered = [...quizzes];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(quiz => getQuizStatus(quiz) === filterStatus);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }, [quizzes, filterStatus]);

  const filterButtons: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Expired', value: 'expired' },
    { label: 'Draft', value: 'draft' },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Quizzes</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage all your quizzes
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/create')}
          aria-label="Create new quiz"
        >
          Create Quiz
        </Button>
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
          onAction={() => router.push('/dashboard/create')}
        />
      )}

      {/* Quizzes Content */}
      {!isLoading && !error && quizzes.length > 0 && (
        <>
          {/* Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
            {filterButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={filterStatus === btn.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(btn.value)}
              >
                {btn.label}
              </Button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}
          </div>

          {/* Quiz Grid */}
          {filteredQuizzes.length > 0 ? (
            <section aria-label="Your quizzes">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz._id}
                    quiz={quiz}
                    submissionCount={getSubmissionCount(quiz)}
                    onDelete={() => loadQuizzes()}
                  />
                ))}
              </div>
            </section>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No quizzes found with the selected filter.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
