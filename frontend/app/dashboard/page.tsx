'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileQuestion, ArrowRight, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';
import { apiClient, APIRequestError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizCard } from '@/components/quiz/QuizCard';
import { CardLoadingSkeleton } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { MockChart } from '@/components/dashboard/MockChart';
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

  // Prioritize active/new quizzes, then show others
  const prioritizedQuizzes = useMemo(() => {
    const now = new Date();
    const sorted = [...quizzes].sort((a, b) => {
      const aExpired = new Date(a.expiresAt) < now;
      const bExpired = new Date(b.expiresAt) < now;
      
      // Active quizzes first
      if (!aExpired && bExpired) return -1;
      if (aExpired && !bExpired) return 1;
      
      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return sorted.slice(0, 3); // Show only 3 quizzes
  }, [quizzes]);

  // Calculate mock analytics
  const analytics = useMemo(() => {
    const totalSubmissions = quizzes.reduce((sum, q) => sum + (q.submissionCount || 0), 0);
    const activeQuizzes = quizzes.filter(q => new Date(q.expiresAt) > new Date()).length;
    const avgCompletion = quizzes.length > 0 ? Math.round((totalSubmissions / quizzes.length) * 10) / 10 : 0;
    
    return {
      totalQuizzes: quizzes.length,
      activeQuizzes,
      totalSubmissions,
      avgCompletion,
    };
  }, [quizzes]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your quizzes and student performance
        </p>
      </div>

      {/* Error State */}
      {!isLoading && error && (
        <ErrorAlert
          title="Failed to Load Dashboard"
          message={error}
          onRetry={loadQuizzes}
          retryLabel="Retry"
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div role="status" aria-live="polite" aria-label="Loading dashboard">
          <CardLoadingSkeleton count={4} />
          <span className="sr-only">Loading dashboard...</span>
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

      {/* Dashboard Content */}
      {!isLoading && !error && quizzes.length > 0 && (
        <>
          {/* Quizzes Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Quizzes</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/quizzes')}
                className="gap-1"
              >
                See More
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-6 border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prioritizedQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz._id}
                    quiz={quiz}
                    submissionCount={getSubmissionCount(quiz)}
                    onDelete={() => loadQuizzes()}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Overview Analytics */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Quizzes
                  </CardTitle>
                  <FileQuestion className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalQuizzes}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.activeQuizzes} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Submissions
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalSubmissions}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all quizzes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg. Completion
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.avgCompletion}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per quiz
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Quizzes
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.activeQuizzes}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Not expired
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Charts Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Performance Insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MockChart
                title="Quiz Activity (Last 7 Days)"
                data={[
                  { label: 'Monday', value: 12 },
                  { label: 'Tuesday', value: 19 },
                  { label: 'Wednesday', value: 15 },
                  { label: 'Thursday', value: 25 },
                  { label: 'Friday', value: 22 },
                  { label: 'Saturday', value: 8 },
                  { label: 'Sunday', value: 5 },
                ]}
              />
              <MockChart
                title="Top Performing Quizzes"
                data={
                  quizzes
                    .sort((a, b) => (b.submissionCount || 0) - (a.submissionCount || 0))
                    .slice(0, 5)
                    .map(q => ({
                      label: q.title.length > 20 ? q.title.substring(0, 20) + '...' : q.title,
                      value: q.submissionCount || 0,
                    }))
                }
              />
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push('/dashboard/create')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileQuestion className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Create Quiz</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate new quiz from materials
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push('/dashboard/quizzes')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">View All Quizzes</h3>
                      <p className="text-sm text-muted-foreground">
                        Browse and filter all quizzes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Templates - Coming Soon */}
              {/* <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push('/dashboard/templates')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Templates</h3>
                      <p className="text-sm text-muted-foreground">
                        Use pre-made quiz templates
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
