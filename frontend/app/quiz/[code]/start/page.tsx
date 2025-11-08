'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Clock, FileText, AlertCircle, CheckCircle2, Calendar, Users } from 'lucide-react';
import { apiClient, APIRequestError } from '@/lib/api';
import type { QuizInfo, QuizSession } from '@/types';

export default function QuizLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const accessCode = params.code as string;
  const { showError, showWarning } = useToast();

  const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch quiz info on mount
    fetchQuizInfo();
  }, [accessCode]);

  const fetchQuizInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate quiz code and get quiz info
      const info = await apiClient.validateQuizCode(accessCode);
      
      // The backend already validates status, so if we get here, the quiz is accessible
      setQuizInfo(info);
    } catch (err) {
      console.error('Error fetching quiz info:', err);
      
      if (err instanceof APIRequestError) {
        if (err.status === 404) {
          setError('Invalid quiz code. Please check the code and try again.');
          showError('Invalid quiz code');
        } else if (err.status === 400) {
          // Parse specific error messages
          const errorMsg = err.message.toLowerCase();
          
          if (errorMsg.includes('not started') || errorMsg.includes('has not started yet')) {
            setError(err.message);
            showWarning('Quiz has not started yet');
          } else if (errorMsg.includes('expired') || errorMsg.includes('no longer available')) {
            setError(err.message);
            showError('Quiz has expired');
          } else if (errorMsg.includes('maximum') || errorMsg.includes('full') || errorMsg.includes('reached')) {
            setError(err.message);
            showWarning('Quiz is full');
          } else {
            setError(err.message);
            showError(err.message);
          }
        } else {
          setError('Unable to load quiz. Please try again later.');
          showError('Server error');
        }
      } else {
        setError('Network error. Please check your connection.');
        showError('Network error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    if (!quizInfo) return;

    try {
      setIsStarting(true);

      // Get student info from sessionStorage
      const studentInfoStr = sessionStorage.getItem('studentInfo');
      if (!studentInfoStr) {
        showError('Student information not found. Please join again.');
        router.push('/join');
        return;
      }

      // Call backend API to get randomized questions
      const quizSession: QuizSession = await apiClient.startQuiz(accessCode);

      // Store quiz session data in sessionStorage
      sessionStorage.setItem('quizSession', JSON.stringify({
        quizId: quizSession.quizId,
        title: quizSession.title,
        duration: quizSession.duration,
        questions: quizSession.questions,
        startTime: Date.now(),
        accessCode: accessCode,
      }));

      // Navigate to quiz taking page
      router.push(`/quiz/${accessCode}/take`);
    } catch (err) {
      console.error('Error starting quiz:', err);
      
      if (err instanceof APIRequestError) {
        if (err.status === 400) {
          setError(err.message);
          showError(err.message);
        } else {
          setError('Unable to start quiz. Please try again.');
          showError('Failed to start quiz');
        }
      } else {
        setError('Network error. Please check your connection.');
        showError('Network error');
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleBackToJoin = () => {
    router.push('/join');
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <LoadingSpinner size="lg" text="Loading quiz information..." />
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  if (error || !quizInfo) {
    return (
      <PublicLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <CardTitle className="text-2xl">Unable to Load Quiz</CardTitle>
              <CardDescription>
                {error || 'An unexpected error occurred.'}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                size="lg"
                onClick={handleBackToJoin}
                className="w-full"
              >
                Back to Join Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  // Check if quiz is not yet active (for displaying alert)
  const isNotYetActive = quizInfo.startDate && new Date(quizInfo.startDate) > new Date();

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Quiz Info Card */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <FileText className="w-16 h-16 text-blue-600" />
              </div>
              <CardTitle className="text-3xl mb-2">
                {quizInfo.title}
              </CardTitle>
              <CardDescription className="text-base">
                You're about to start this quiz
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Quiz Details with Badges */}
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="secondary" className="px-4 py-2 text-base">
                  <Clock className="w-4 h-4 mr-2" />
                  {quizInfo.duration} minutes
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-base">
                  <FileText className="w-4 h-4 mr-2" />
                  {quizInfo.questionsPerStudent} questions
                </Badge>
                <Badge variant="default" className="px-4 py-2 text-base bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Active
                </Badge>
              </div>

              <Separator />

              {/* Additional Info: Start Date and Remaining Spots */}
              {(quizInfo.startDate || quizInfo.maxStudents) && (
                <>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Quiz Information
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      {quizInfo.startDate && (
                        <div className="flex items-start">
                          <Calendar className="mr-2 text-blue-600 mt-0.5 h-4 w-4" />
                          <div>
                            <span className="font-medium">Start Date: </span>
                            <span>
                              {new Date(quizInfo.startDate).toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                      {quizInfo.maxStudents && (
                        <div className="flex items-start">
                          <Users className="mr-2 text-blue-600 mt-0.5 h-4 w-4" />
                          <div>
                            <span className="font-medium">Remaining Spots: </span>
                            <span className={
                              quizInfo.maxStudents - quizInfo.currentSubmissions <= 5
                                ? 'text-orange-600 font-semibold'
                                : 'text-gray-700'
                            }>
                              {quizInfo.maxStudents - quizInfo.currentSubmissions} of {quizInfo.maxStudents}
                            </span>
                            {quizInfo.maxStudents - quizInfo.currentSubmissions <= 5 && (
                              <span className="ml-2 text-orange-600 text-xs">(Limited spots!)</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Alert when quiz is not yet active */}
              {isNotYetActive && (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Quiz Not Yet Active</AlertTitle>
                    <AlertDescription>
                      This quiz will become available on{' '}
                      {new Date(quizInfo.startDate!).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                      . Please check back at that time.
                    </AlertDescription>
                  </Alert>

                  <Separator />
                </>
              )}

              {/* Important Instructions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="mr-2 text-yellow-600 h-5 w-5" />
                  Important Instructions
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2 font-bold">•</span>
                    <span>Once you start, the timer will begin counting down automatically</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2 font-bold">•</span>
                    <span>Your quiz will auto-submit when the timer reaches zero</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2 font-bold">•</span>
                    <span>You cannot pause or restart the quiz once you begin</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2 font-bold">•</span>
                    <span>Make sure you have a stable internet connection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2 font-bold">•</span>
                    <span>Do not refresh or close your browser during the quiz</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Quiz Rules */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Quiz Rules
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle2 className="text-blue-600 mr-2 h-4 w-4 mt-0.5" />
                    <span>Each question has four options, only one is correct</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="text-blue-600 mr-2 h-4 w-4 mt-0.5" />
                    <span>You can navigate between questions using Previous/Next buttons</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="text-blue-600 mr-2 h-4 w-4 mt-0.5" />
                    <span>You must answer all questions before submitting</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="text-blue-600 mr-2 h-4 w-4 mt-0.5" />
                    <span>Your score will be displayed immediately after submission</span>
                  </li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleBackToJoin}
                disabled={isStarting || !!isNotYetActive}
                className="flex-1 w-full"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={handleStartQuiz}
                disabled={isStarting || !!isNotYetActive}
                className="flex-1 w-full"
              >
                {isStarting ? 'Starting Quiz...' : 'Start Quiz'}
              </Button>
            </CardFooter>
          </Card>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-600">
            <p>
              Quiz Code: <span className="font-mono font-bold text-gray-900">{accessCode}</span>
            </p>
            {quizInfo.expiresAt && (
              <p className="mt-2">
                Expires: {new Date(quizInfo.expiresAt).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            )}
            <p className="mt-2">
              Good luck! 🍀
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
