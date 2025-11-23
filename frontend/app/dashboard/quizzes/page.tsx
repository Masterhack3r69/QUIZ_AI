'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileQuestion, Filter, LayoutGrid, List, ExternalLink, Trash2, Copy, MoreVertical } from 'lucide-react';
import { apiClient, APIRequestError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { QuizCard } from '@/components/quiz/QuizCard';
import { CardLoadingSkeleton } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Quiz } from '@/types';

type FilterStatus = 'all' | 'active' | 'expired' | 'scheduled' | 'draft';
type ViewMode = 'grid' | 'table';

export default function AllQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const router = useRouter();
  const { showError, showSuccess } = useToast();

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

  const handleCopyLink = (quizId: string) => {
    const link = `${window.location.origin}/join?code=${quizId}`;
    navigator.clipboard.writeText(link);
    showSuccess('Quiz link copied to clipboard!');
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      await apiClient.deleteQuiz(quizId);
      showSuccess('Quiz deleted successfully');
      loadQuizzes();
    } catch (err) {
      showError('Failed to delete quiz');
    }
  };

  const getStatusBadge = (status: Quiz['status']) => {
    const variants: Record<Quiz['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      expired: { variant: 'secondary', label: 'Expired' },
      scheduled: { variant: 'outline', label: 'Scheduled' },
      draft: { variant: 'secondary', label: 'Draft' },
      full: { variant: 'destructive', label: 'Full' },
    };
    
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => router.push('/dashboard/create')}
            aria-label="Create new quiz"
          >
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

          {/* Quiz Grid/Table View */}
          {filteredQuizzes.length > 0 ? (
            <section aria-label="Your quizzes">
              {viewMode === 'grid' ? (
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
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuizzes.map((quiz) => {
                        const status = getQuizStatus(quiz);
                        return (
                          <TableRow key={quiz._id} className="hover:bg-muted/50">
                            <TableCell className="font-medium max-w-[300px]">
                              <div className="flex flex-col gap-1">
                                <span className="truncate">{quiz.title}</span>
                                {quiz.subjects && quiz.subjects.length > 0 && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {quiz.subjects.join(', ')}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {quiz.duration} min
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span>{getSubmissionCount(quiz)}</span>
                                {quiz.maxStudents && (
                                  <span className="text-xs text-muted-foreground">
                                    / {quiz.maxStudents} max
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(quiz.createdAt)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(quiz.expiresAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/quiz/${quiz._id}`)}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleCopyLink(quiz._id)}>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Copy Link
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/quiz/${quiz._id}`)}>
                                      <ExternalLink className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteQuiz(quiz._id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
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
