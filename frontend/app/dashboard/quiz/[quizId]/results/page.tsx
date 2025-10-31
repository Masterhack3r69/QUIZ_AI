'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient, APIRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { AnalyticsCardsSkeleton, SubmissionsTableSkeleton } from '@/components/ui/SkeletonLoader';
import { exportToPDF, exportToExcel } from '@/lib/export';
import type { Analytics, Quiz } from '@/types';

const ITEMS_PER_PAGE = 20;

export default function QuizResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [quizId]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load both analytics and quiz details
      const [analyticsData, quizData] = await Promise.all([
        apiClient.getQuizAnalytics(quizId),
        apiClient.getQuiz(quizId),
      ]);
      
      console.log('📊 Analytics Data:', analyticsData);
      console.log('📝 Quiz Data:', quizData);
      console.log('👥 Submissions:', analyticsData?.submissions);
      console.log('📈 Total Submissions:', analyticsData?.totalSubmissions);
      
      setAnalytics(analyticsData);
      setQuiz(quizData);
    } catch (err) {
      console.error('❌ Error loading analytics:', err);
      if (err instanceof APIRequestError) {
        setError(err.message);
      } else {
        setError('Failed to load analytics. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!analytics || !quiz) return;
    
    try {
      setIsExporting(true);
      setExportError(null);
      setExportSuccess(null);
      
      await exportToPDF(analytics, quiz.title);
      
      setExportSuccess('PDF exported successfully!');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
      setExportError('Failed to export PDF. Please try again.');
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!analytics || !quiz) return;
    
    try {
      setIsExporting(true);
      setExportError(null);
      setExportSuccess(null);
      
      await exportToExcel(analytics, quiz.title);
      
      setExportSuccess('Excel file exported successfully!');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('Excel export error:', err);
      setExportError('Failed to export Excel. Please try again.');
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (seconds: number): string => {
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

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Results
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => router.push(`/dashboard/quiz/${quizId}`)}>
            Back to Quiz
          </Button>
        </Card>
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
          
          {analytics && analytics.totalSubmissions > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></span>
                    Exporting...
                  </>
                ) : (
                  <>📄 Export to PDF</>
                )}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleExportExcel}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></span>
                    Exporting...
                  </>
                ) : (
                  <>📊 Export to Excel</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      {exportSuccess && (
        <Toast
          type="success"
          message={exportSuccess}
          onClose={() => setExportSuccess(null)}
        />
      )}
      {exportError && (
        <Toast
          type="error"
          message={exportError}
          onClose={() => setExportError(null)}
        />
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">
              Total Submissions
            </div>
            <div className="text-2xl">📊</div>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {analytics.totalSubmissions}
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
            {analytics.averageScore}
          </div>
          <div className="text-sm text-gray-500">
            out of {analytics.totalQuestions}
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
            {analytics.highestScore}
          </div>
          <div className="text-sm text-gray-500">
            out of {analytics.totalQuestions}
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
            {analytics.lowestScore}
          </div>
          <div className="text-sm text-gray-500">
            out of {analytics.totalQuestions}
          </div>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Student Submissions
          </h2>

          {analytics.totalSubmissions === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
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
                    {paginatedSubmissions.map((submission, index) => (
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
                            {submission.score} / {submission.totalQuestions || analytics.totalQuestions}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              parseFloat(submission.percentage) >= 80
                                ? 'bg-green-100 text-green-800'
                                : parseFloat(submission.percentage) >= 60
                                ? 'bg-blue-100 text-blue-800'
                                : parseFloat(submission.percentage) >= 40
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {submission.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {formatTime(submission.timeTaken)}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked View */}
              <div className="md:hidden space-y-4">
                {paginatedSubmissions.map((submission, index) => (
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
                          parseFloat(submission.percentage) >= 80
                            ? 'bg-green-100 text-green-800'
                            : parseFloat(submission.percentage) >= 60
                            ? 'bg-blue-100 text-blue-800'
                            : parseFloat(submission.percentage) >= 40
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {submission.percentage}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-600 mb-1">Score</div>
                        <div className="font-semibold text-gray-900">
                          {submission.score} / {submission.totalQuestions || analytics.totalQuestions}
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
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, sortedSubmissions.length)} of{' '}
                    {sortedSubmissions.length} submissions
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
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
                            <span key={page} className="px-2 text-gray-500">
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
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                        <div className="text-xs text-gray-500 mb-1">
                          Question {index + 1}
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
