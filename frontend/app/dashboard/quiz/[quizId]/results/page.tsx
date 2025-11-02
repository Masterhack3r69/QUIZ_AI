'use client';

import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient, APIRequestError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { AnalyticsCardsSkeleton, SubmissionsTableSkeleton } from '@/components/ui/SkeletonLoader';
import type { Analytics, Quiz } from '@/types';

// Lazy load the export buttons component to reduce initial bundle size
const ExportButtons = lazy(() => 
  import('@/components/analytics/ExportButtons').then(mod => ({ default: mod.ExportButtons }))
);

const ITEMS_PER_PAGE = 20;

export default function QuizResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const { showError } = useToast();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAnalytics();
  }, [quizId]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Load both analytics and quiz details
      const [analyticsData, quizData] = await Promise.all([
        apiClient.getQuizAnalytics(quizId),
        apiClient.getQuiz(quizId),
      ]);
      
      console.log('📊 Analytics Data:', analyticsData);
      console.log('📝 Quiz Data:', quizData);
      console.log('👥 Submissions:', analyticsData?.submissions);
      console.log('📈 Total Submissions:', analyticsData?.summary.totalSubmissions);
      
      setAnalytics(analyticsData);
      setQuiz(quizData);
    } catch (err) {
      console.error('❌ Error loading analytics:', err);
      if (err instanceof APIRequestError) {
        showError(err.message);
      } else {
        showError('Failed to load analytics. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Sort submissions by submission time (most recent first) and paginate
  const { sortedSubmissions, totalPages, paginatedSubmissions } = useMemo(() => {
    console.log('🔄 Recalculating pagination...');
    console.log('📦 analytics?.submissions:', analytics?.submissions);
    
    if (!analytics?.submissions) {
      console.log('⚠️ No submissions found in analytics');
      return { sortedSubmissions: [], totalPages: 0, paginatedSubmissions: [] };
    }

    console.log('✅ Submissions array length:', analytics.submissions.length);

    // Sort by submittedAt descending (most recent first)
    const sorted = [...analytics.submissions].sort((a, b) => {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    // Calculate pagination
    const total = Math.ceil(sorted.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginated = sorted.slice(startIndex, endIndex);

    console.log('📄 Paginated submissions:', paginated);
    console.log('📊 Total pages:', total);

    return {
      sortedSubmissions: sorted,
      totalPages: total,
      paginatedSubmissions: paginated,
    };
  }, [analytics?.submissions, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <AnalyticsCardsSkeleton />
        <div className="mt-8">
          <SubmissionsTableSkeleton count={5} />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/quiz/${quizId}`)}
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
          Back to Quiz
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Results & Analytics</h1>
          
          {analytics && analytics.summary.totalSubmissions > 0 && quiz && (
            <Suspense fallback={
              <div className="flex gap-2">
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            }>
              <ExportButtons analytics={analytics} quiz={quiz} />
            </Suspense>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">
              Total Submissions
            </div>
            <Icon name="chart" size="lg" />
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {analytics.summary.totalSubmissions}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">
              Average Score
            </div>
            <div className="text-2xl">📈</div>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {analytics.summary.averageScore.toFixed(1)}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">
              Highest Score
            </div>
            <div className="text-2xl">🏆</div>
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            {analytics.summary.highestScore}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">
              Lowest Score
            </div>
            <div className="text-2xl">📉</div>
          </div>
          <div className="text-3xl font-bold text-amber-600">
            {analytics.summary.lowestScore}
          </div>
        </Card>
      </div>

      {/* Question Type Breakdown and Performance */}
      {analytics.summary.questionTypeBreakdown && analytics.summary.averageScoreByType && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Question Type Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Question Type Distribution
            </h2>
            <div className="space-y-3">
              {Object.entries(analytics.summary.questionTypeBreakdown).map(([type, count]) => {
                if (count === 0) return null;
                const typeLabels: Record<string, string> = {
                  multipleChoice: 'Multiple Choice',
                  trueFalse: 'True/False',
                  fillInBlank: 'Fill in the Blank',
                  matching: 'Matching'
                };
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {typeLabels[type]}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {count} {count === 1 ? 'question' : 'questions'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Average Score by Question Type */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Average Score by Question Type
            </h2>
            <div className="space-y-3">
              {Object.entries(analytics.summary.averageScoreByType).map(([type, score]) => {
                const count = analytics.summary.questionTypeBreakdown?.[type as keyof typeof analytics.summary.questionTypeBreakdown] || 0;
                if (count === 0) return null;
                const typeLabels: Record<string, string> = {
                  multipleChoice: 'Multiple Choice',
                  trueFalse: 'True/False',
                  fillInBlank: 'Fill in the Blank',
                  matching: 'Matching'
                };
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {typeLabels[type]}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          score >= 80
                            ? 'text-green-600'
                            : score >= 60
                            ? 'text-blue-600'
                            : score >= 40
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          score >= 80
                            ? 'bg-green-600'
                            : score >= 60
                            ? 'bg-blue-600'
                            : score >= 40
                            ? 'bg-amber-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Submissions Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Student Submissions
          </h2>

          {analytics.summary.totalSubmissions === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <Icon name="document" className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Submissions Yet
              </h3>
              <p className="text-gray-600">
                Students haven't submitted any answers for this quiz yet.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Student Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Student ID
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Score
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Percentage
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Time Taken
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Submitted At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubmissions.map((submission, index) => {
                      const percentage = Math.round((submission.score / submission.totalQuestions) * 100);
                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-gray-900">
                            {submission.studentName}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {submission.studentId}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold text-gray-900">
                              {submission.score} / {submission.totalQuestions}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                percentage >= 80
                                  ? 'bg-green-100 text-green-800'
                                  : percentage >= 60
                                  ? 'bg-blue-100 text-blue-800'
                                  : percentage >= 40
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {percentage}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-600">
                            {formatTime(submission.timeTaken)}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-600">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked View */}
              <div className="md:hidden space-y-4">
                {paginatedSubmissions.map((submission, index) => {
                  const percentage = Math.round((submission.score / submission.totalQuestions) * 100);
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">
                            {submission.studentName}
                          </div>
                          <div className="text-sm text-gray-600">
                            ID: {submission.studentId}
                          </div>
                        </div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            percentage >= 80
                              ? 'bg-green-100 text-green-800'
                              : percentage >= 60
                              ? 'bg-blue-100 text-blue-800'
                              : percentage >= 40
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-600 mb-1">Score</div>
                        <div className="font-semibold text-gray-900">
                          {submission.score} / {submission.totalQuestions}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">Time Taken</div>
                        <div className="font-semibold text-gray-900">
                          {formatTime(submission.timeTaken)}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-gray-600 mb-1">Submitted At</div>
                        <div className="font-semibold text-gray-900">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 text-center sm:text-left">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, sortedSubmissions.length)} of{' '}
                    {sortedSubmissions.length} submissions
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="touch-manipulation"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);
                        
                        const showEllipsis =
                          (page === 2 && currentPage > 3) ||
                          (page === totalPages - 1 && currentPage < totalPages - 2);

                        if (showEllipsis) {
                          return (
                            <span key={page} className="px-1 sm:px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }

                        if (!showPage) {
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-2 sm:px-3 py-1 rounded text-sm font-medium transition-colors touch-manipulation min-w-[32px] ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="touch-manipulation"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Question Statistics */}
      {analytics.questionStats && analytics.questionStats.length > 0 && (
        <Card className="mt-6">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Question Performance Analysis
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Questions sorted by accuracy rate (lowest first). Red highlights indicate the most missed questions.
            </p>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 w-12">
                      #
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 w-32">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Question
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Correct Answers
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Total Attempts
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Accuracy Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.questionStats.map((stat, index) => {
                    const isLowAccuracy = stat.accuracyRate < 50;
                    const typeLabels: Record<string, string> = {
                      multipleChoice: 'Multiple Choice',
                      trueFalse: 'True/False',
                      fillInBlank: 'Fill in Blank',
                      matching: 'Matching'
                    };
                    const typeColors: Record<string, string> = {
                      multipleChoice: 'bg-blue-100 text-blue-800',
                      trueFalse: 'bg-purple-100 text-purple-800',
                      fillInBlank: 'bg-green-100 text-green-800',
                      matching: 'bg-orange-100 text-orange-800'
                    };
                    return (
                      <tr
                        key={stat.questionId}
                        className={`border-b border-gray-100 transition-colors ${
                          isLowAccuracy ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-4 text-gray-600 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${typeColors[stat.questionType] || 'bg-gray-100 text-gray-800'}`}>
                            {typeLabels[stat.questionType] || stat.questionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {stat.question}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-900 font-semibold">
                          {stat.correctCount}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {stat.totalAttempts}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              stat.accuracyRate >= 80
                                ? 'bg-green-100 text-green-800'
                                : stat.accuracyRate >= 60
                                ? 'bg-blue-100 text-blue-800'
                                : stat.accuracyRate >= 40
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {stat.accuracyRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {analytics.questionStats.map((stat, index) => {
                const isLowAccuracy = stat.accuracyRate < 50;
                const typeLabels: Record<string, string> = {
                  multipleChoice: 'Multiple Choice',
                  trueFalse: 'True/False',
                  fillInBlank: 'Fill in Blank',
                  matching: 'Matching'
                };
                const typeColors: Record<string, string> = {
                  multipleChoice: 'bg-blue-100 text-blue-800',
                  trueFalse: 'bg-purple-100 text-purple-800',
                  fillInBlank: 'bg-green-100 text-green-800',
                  matching: 'bg-orange-100 text-orange-800'
                };
                return (
                  <div
                    key={stat.questionId}
                    className={`border rounded-lg p-4 transition-shadow ${
                      isLowAccuracy
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">
                            Question {index + 1}
                          </span>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${typeColors[stat.questionType] || 'bg-gray-100 text-gray-800'}`}>
                            {typeLabels[stat.questionType] || stat.questionType}
                          </span>
                        </div>
                        <div className="text-sm text-gray-900 font-medium">
                          {stat.question}
                        </div>
                      </div>
                      <span
                        className={`ml-3 inline-block px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                          stat.accuracyRate >= 80
                            ? 'bg-green-100 text-green-800'
                            : stat.accuracyRate >= 60
                            ? 'bg-blue-100 text-blue-800'
                            : stat.accuracyRate >= 40
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {stat.accuracyRate}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-600 mb-1">Correct</div>
                        <div className="font-semibold text-gray-900">
                          {stat.correctCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">Total Attempts</div>
                        <div className="font-semibold text-gray-900">
                          {stat.totalAttempts}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
