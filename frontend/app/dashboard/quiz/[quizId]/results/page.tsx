'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient, APIRequestError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Download, FileText, FileSpreadsheet, TrendingUp, Trophy, TrendingDown, Users } from 'lucide-react';
import { StatsCardSkeleton, TableLoadingSkeleton } from '@/components/shared/LoadingState';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { TableEmptyState } from '@/components/shared/EmptyState';
import type { Analytics, Quiz } from '@/types';

const ITEMS_PER_PAGE = 20;

export default function QuizResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const { showError } = useToast();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
      console.log('📈 Total Submissions:', analyticsData?.summary.totalSubmissions);
      
      setAnalytics(analyticsData);
      setQuiz(quizData);
    } catch (err) {
      console.error('❌ Error loading analytics:', err);
      let errorMessage = 'Failed to load analytics. Please try again.';
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
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/quiz/${quizId}`)}
          className="-ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quiz
        </Button>
        <StatsCardSkeleton count={4} />
        <Card>
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <TableLoadingSkeleton rows={5} columns={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/quiz/${quizId}`)}
          className="-ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quiz
        </Button>
        <ErrorAlert
          title="Failed to Load Analytics"
          message={error}
          onRetry={loadAnalytics}
          retryLabel="Retry"
        />
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/quiz/${quizId}`)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quiz
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Quiz Results & Analytics</h1>
          
          {analytics && analytics.summary.totalSubmissions > 0 && quiz && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Results
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  // Export as PDF logic
                  console.log('Export as PDF');
                }}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // Export as Excel logic
                  console.log('Export as Excel');
                }}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.summary.totalSubmissions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.summary.averageScore.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Highest Score
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {analytics.summary.highestScore}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lowest Score
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {analytics.summary.lowestScore}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Type Breakdown and Performance */}
      {analytics.summary.questionTypeBreakdown && analytics.summary.averageScoreByType && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Question Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Question Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                    <span className="text-sm font-medium">
                      {typeLabels[type]}
                    </span>
                    <Badge variant="secondary">
                      {count} {count === 1 ? 'question' : 'questions'}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Average Score by Question Type */}
          <Card>
            <CardHeader>
              <CardTitle>Average Score by Question Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {typeLabels[type]}
                      </span>
                      <span className="text-sm font-bold">
                        {score.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
          <CardDescription>
            Detailed breakdown of all student submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.summary.totalSubmissions === 0 ? (
            <TableEmptyState
              icon={Users}
              title="No submissions yet"
              description="Students haven't taken this quiz yet. Share the quiz code with your students to get started."
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Percentage</TableHead>
                      <TableHead className="text-center">Time Taken</TableHead>
                      <TableHead className="text-center">Submitted At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubmissions.map((submission, index) => {
                      const percentage = Math.round((submission.score / submission.totalQuestions) * 100);
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {submission.studentName}
                          </TableCell>
                          <TableCell>
                            {submission.studentId}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {submission.score} / {submission.totalQuestions}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                percentage >= 80
                                  ? 'default'
                                  : percentage >= 60
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {percentage}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {formatTime(submission.timeTaken)}
                          </TableCell>
                          <TableCell className="text-center">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paginatedSubmissions.map((submission, index) => {
                  const percentage = Math.round((submission.score / submission.totalQuestions) * 100);
                  return (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {submission.studentName}
                            </CardTitle>
                            <CardDescription>
                              ID: {submission.studentId}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              percentage >= 80
                                ? 'default'
                                : percentage >= 60
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {percentage}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Score</div>
                          <div className="font-semibold">
                            {submission.score} / {submission.totalQuestions}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Time Taken</div>
                          <div className="font-semibold">
                            {formatTime(submission.timeTaken)}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-muted-foreground mb-1">Submitted At</div>
                          <div className="font-semibold">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t pt-4">
                  <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, sortedSubmissions.length)} of{' '}
                    {sortedSubmissions.length} submissions
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
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
                            <span key={page} className="px-1 sm:px-2 text-muted-foreground">
                              ...
                            </span>
                          );
                        }

                        if (!showPage) {
                          return null;
                        }

                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="min-w-[32px]"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
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
        </CardContent>
      </Card>

      {/* Question Statistics */}
      {analytics.questionStats && analytics.questionStats.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Question Performance Analysis</CardTitle>
            <CardDescription>
              Questions sorted by accuracy rate (lowest first). Most missed questions are highlighted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-32">Type</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead className="text-center">Accuracy</TableHead>
                    <TableHead className="text-center">Correct</TableHead>
                    <TableHead className="text-center">Attempts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.questionStats.map((stat, index) => {
                    const isLowAccuracy = stat.accuracyRate < 50;
                    const typeLabels: Record<string, string> = {
                      multipleChoice: 'Multiple Choice',
                      trueFalse: 'True/False',
                      fillInBlank: 'Fill in Blank',
                      matching: 'Matching'
                    };
                    return (
                      <TableRow
                        key={stat.questionId}
                        className={isLowAccuracy ? 'bg-destructive/10' : ''}
                      >
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {typeLabels[stat.questionType] || stat.questionType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            {isLowAccuracy && (
                              <Badge variant="destructive" className="mt-0.5">
                                Most Missed
                              </Badge>
                            )}
                            <span>{stat.question}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <div className="font-semibold">{stat.accuracyRate}%</div>
                            <Progress value={stat.accuracyRate} className="h-1.5 w-20 mx-auto" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {stat.correctCount}
                        </TableCell>
                        <TableCell className="text-center">
                          {stat.totalAttempts}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
                return (
                  <Card
                    key={stat.questionId}
                    className={isLowAccuracy ? 'border-destructive' : ''}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Question {index + 1}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[stat.questionType] || stat.questionType}
                          </Badge>
                        </div>
                        {isLowAccuracy && (
                          <Badge variant="destructive" className="text-xs">
                            Most Missed
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-sm font-medium">
                        {stat.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                          <span className="text-sm font-bold">{stat.accuracyRate}%</span>
                        </div>
                        <Progress value={stat.accuracyRate} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Correct</div>
                          <div className="font-semibold">
                            {stat.correctCount}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Total Attempts</div>
                          <div className="font-semibold">
                            {stat.totalAttempts}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
