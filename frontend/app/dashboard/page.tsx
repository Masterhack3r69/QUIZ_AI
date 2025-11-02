'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, APIRequestError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { QuizListSkeleton } from '@/components/ui/SkeletonLoader';
import { QuizCard } from '@/components/quiz/QuizCard';
import type { Quiz } from '@/types';

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showError } = useToast();

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  // Sort state
  const [sortBy, setSortBy] = useState<string>('dateCreated');

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Load sort preference from localStorage
  useEffect(() => {
    const savedSort = localStorage.getItem('quizSortPreference');
    if (savedSort) {
      setSortBy(savedSort);
    }
  }, []);

  // Save sort preference to localStorage
  useEffect(() => {
    localStorage.setItem('quizSortPreference', sortBy);
  }, [sortBy]);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getMyQuizzes();
      setQuizzes(data);
    } catch (err) {
      if (err instanceof APIRequestError) {
        showError(err.message);
      } else {
        showError('Failed to load quizzes. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmissionCount = (quiz: Quiz): number => {
    return quiz.submissionCount || 0;
  };

  // Get unique subjects from all quizzes
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    quizzes.forEach(quiz => {
      if (quiz.subjects && Array.isArray(quiz.subjects)) {
        quiz.subjects.forEach(subject => subjects.add(subject));
      }
    });
    return Array.from(subjects).sort();
  }, [quizzes]);

  // Helper function to get quiz status
  const getQuizStatus = (quiz: Quiz): Quiz['status'] => {
    const now = new Date();
    const expirationDate = new Date(quiz.expiresAt);
    const startDate = quiz.startDate ? new Date(quiz.startDate) : null;

    if (expirationDate < now) {
      return 'expired';
    }

    if (quiz.maxStudents && quiz.submissionCount && quiz.submissionCount >= quiz.maxStudents) {
      return 'full';
    }

    if (startDate && startDate > now) {
      return 'scheduled';
    }

    if (quiz.status === 'draft') {
      return 'draft';
    }

    return 'active';
  };

  // Filter and sort quizzes
  const filteredAndSortedQuizzes = useMemo(() => {
    // First, filter the quizzes
    const filtered = quizzes.filter(quiz => {
      // Status filter
      if (statusFilter !== 'all') {
        const quizStatus = getQuizStatus(quiz);
        if (quizStatus !== statusFilter) {
          return false;
        }
      }

      // Subject filter
      if (subjectFilter !== 'all') {
        if (!quiz.subjects || !quiz.subjects.includes(subjectFilter)) {
          return false;
        }
      }

      // Date range filter
      if (startDateFilter) {
        const quizDate = new Date(quiz.createdAt);
        const filterDate = new Date(startDateFilter);
        if (quizDate < filterDate) {
          return false;
        }
      }

      if (endDateFilter) {
        const quizDate = new Date(quiz.createdAt);
        const filterDate = new Date(endDateFilter);
        // Set end date to end of day
        filterDate.setHours(23, 59, 59, 999);
        if (quizDate > filterDate) {
          return false;
        }
      }

      return true;
    });

    // Then, sort the filtered quizzes
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'dateCreated':
          // Newest first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        case 'dateCreatedOldest':
          // Oldest first
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        
        case 'title':
          // Alphabetical A-Z
          return a.title.localeCompare(b.title);
        
        case 'titleDesc':
          // Alphabetical Z-A
          return b.title.localeCompare(a.title);
        
        case 'status':
          // Sort by status priority: active > scheduled > full > expired > draft
          const statusPriority: Record<string, number> = {
            active: 1,
            scheduled: 2,
            full: 3,
            expired: 4,
            draft: 5,
          };
          const aStatus = getQuizStatus(a);
          const bStatus = getQuizStatus(b);
          const aPriority = statusPriority[aStatus] || 99;
          const bPriority = statusPriority[bStatus] || 99;
          return aPriority - bPriority;
        
        case 'expiresAt':
          // Expiring soonest first
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        
        default:
          return 0;
      }
    });

    return sorted;
  }, [quizzes, statusFilter, subjectFilter, startDateFilter, endDateFilter, sortBy]);

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setSubjectFilter('all');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== 'all' || subjectFilter !== 'all' || startDateFilter || endDateFilter;

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
            <Icon name="plus" className="mr-2" />
            Create New Quiz
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      {!isLoading && quizzes.length > 0 && (
        <Card className="mb-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                aria-label="Clear all filters"
                className="self-start sm:self-auto"
              >
                <Icon name="x-mark" className="mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Status Filter */}
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'active', label: 'Active' },
                { value: 'full', label: 'Full' },
                { value: 'expired', label: 'Expired' },
                { value: 'draft', label: 'Draft' },
              ]}
              aria-label="Filter by status"
            />

            {/* Subject Filter */}
            <Select
              label="Subject"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Subjects' },
                ...availableSubjects.map(subject => ({
                  value: subject,
                  label: subject,
                })),
              ]}
              aria-label="Filter by subject"
              disabled={availableSubjects.length === 0}
            />

            {/* Start Date Filter */}
            <Input
              type="date"
              label="From Date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              aria-label="Filter from date"
            />

            {/* End Date Filter */}
            <Input
              type="date"
              label="To Date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              aria-label="Filter to date"
              min={startDateFilter}
            />
          </div>

          {/* Sort and Results Count */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="text-sm text-gray-600 order-2 sm:order-1">
              Showing {filteredAndSortedQuizzes.length} of {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}
            </div>
            
            {/* Sort Dropdown */}
            <div className="w-full sm:w-64 order-1 sm:order-2">
              <Select
                label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'dateCreated', label: 'Date Created (Newest)' },
                  { value: 'dateCreatedOldest', label: 'Date Created (Oldest)' },
                  { value: 'title', label: 'Title (A-Z)' },
                  { value: 'titleDesc', label: 'Title (Z-A)' },
                  { value: 'status', label: 'Status' },
                  { value: 'expiresAt', label: 'Expiration Date' },
                ]}
                aria-label="Sort quizzes"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div role="status" aria-live="polite" aria-label="Loading quizzes">
          <QuizListSkeleton count={6} />
          <span className="sr-only">Loading your quizzes...</span>
        </div>
      )}

      {/* Empty State - No Quizzes */}
      {!isLoading && quizzes.length === 0 && (
        <Card className="text-center py-12">
          <div className="flex justify-center mb-4">
            <Icon name="document" className="w-16 h-16 text-gray-400" />
          </div>
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

      {/* Empty State - No Results After Filtering */}
      {!isLoading && quizzes.length > 0 && filteredAndSortedQuizzes.length === 0 && (
        <Card className="text-center py-12">
          <div className="flex justify-center mb-4">
            <Icon name="funnel" className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No quizzes match your filters
          </h2>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters to see more results
          </p>
          <Button
            variant="secondary"
            onClick={clearFilters}
            aria-label="Clear filters"
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* Quiz Grid */}
      {!isLoading && filteredAndSortedQuizzes.length > 0 && (
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
    </main>
  );
}
