'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button, Icon } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <LoadingSpinner size="lg" text="Loading quiz information..." />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !quizInfo) {
    return (
      <PublicLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Unable to Load Quiz
              </h1>
              <p className="text-gray-600 mb-6">
                {error || 'An unexpected error occurred.'}
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleBackToJoin}
                className="w-full"
              >
                Back to Join Page
              </Button>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Quiz Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Icon name="document" className="w-16 h-16 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {quizInfo.title}
              </h1>
              <p className="text-gray-600">
                You're about to start this quiz
              </p>
            </div>

            {/* Quiz Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <Icon name="clock" size="xl" className="text-blue-600" />
                </div>
                <div className="text-sm text-gray-600 mb-1">Duration</div>
                <div className="text-xl font-bold text-gray-900">
                  {quizInfo.duration} minutes
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">❓</div>
                <div className="text-sm text-gray-600 mb-1">Questions</div>
                <div className="text-xl font-bold text-gray-900">
                  {quizInfo.questionsPerStudent}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <div className="text-xl font-bold text-green-600">
                  Active
                </div>
              </div>
            </div>

            {/* Additional Info: Start Date and Remaining Spots */}
            {(quizInfo.startDate || quizInfo.maxStudents) && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Quiz Information
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  {quizInfo.startDate && (
                    <div className="flex items-start">
                      <Icon name="calendar" className="mr-2 text-blue-600 mt-0.5" size="sm" />
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
                      <Icon name="users" className="mr-2 text-blue-600 mt-0.5" size="sm" />
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
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Icon name="warning" className="mr-2 text-yellow-600" />
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

            {/* Quiz Rules */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Quiz Rules
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Each question has four options, only one is correct</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>You can navigate between questions using Previous/Next buttons</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>You must answer all questions before submitting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Your score will be displayed immediately after submission</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleBackToJoin}
                disabled={isStarting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartQuiz}
                loading={isStarting}
                disabled={isStarting}
                className="flex-1"
              >
                {isStarting ? 'Starting Quiz...' : 'Start Quiz'}
              </Button>
            </div>
          </div>

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
