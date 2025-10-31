'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import type { Answer } from '@/types';

interface QuizResult {
  score: number;
  totalQuestions: number;
  answers: Answer[];
  timeTaken: number; // in seconds
  isAutoSubmit: boolean;
}

interface QuizSessionData {
  quizId: string;
  title: string;
  questions: {
    _id: string;
    question: string;
    options: string[];
  }[];
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const accessCode = params.code as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [quizSession, setQuizSession] = useState<QuizSessionData | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    // Load result from sessionStorage
    const resultStr = sessionStorage.getItem('quizResult');
    const sessionStr = sessionStorage.getItem('quizSession');

    if (!resultStr) {
      // No result found, redirect to join page
      router.push('/join');
      return;
    }

    try {
      const quizResult: QuizResult = JSON.parse(resultStr);
      setResult(quizResult);

      // Load quiz session for question details (if available)
      if (sessionStr) {
        const session: QuizSessionData = JSON.parse(sessionStr);
        setQuizSession(session);
      }
    } catch (error) {
      console.error('Error parsing result data:', error);
      router.push('/join');
    }
  }, [router]);

  // Prevent navigation back to quiz taking page
  useEffect(() => {
    const handlePopState = () => {
      // Push forward to results page if user tries to go back
      router.push(`/quiz/${accessCode}/results`);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [accessCode, router]);

  const handleBackToHome = () => {
    // Clear all quiz-related session data
    sessionStorage.removeItem('quizResult');
    sessionStorage.removeItem('quizSession');
    sessionStorage.removeItem('studentInfo');
    sessionStorage.removeItem('quizAnswers');
    sessionStorage.removeItem('quiz_timer_state');
    
    router.push('/join');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!result) {
    return (
      <PublicLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading results...</p>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const isPassing = percentage >= 60; // Consider 60% as passing

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Results Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-6">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isPassing ? 'bg-green-100' : 'bg-amber-100'
              }`}>
                {isPassing ? (
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-12 h-12 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Completion Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {result.isAutoSubmit ? 'Time\'s Up!' : 'Quiz Completed!'}
              </h1>
              <p className="text-lg text-gray-600">
                {isPassing 
                  ? 'Great job! You passed the quiz.' 
                  : 'Keep practicing to improve your score.'}
              </p>
            </div>

            {/* Score Display */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-6">
              <div className="text-center">
                <div className="text-6xl md:text-7xl font-bold text-blue-600 mb-2">
                  {result.score}/{result.totalQuestions}
                </div>
                <div className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
                  {percentage}%
                </div>
                <div className="text-sm text-gray-600">
                  You answered {result.score} out of {result.totalQuestions} questions correctly
                </div>
              </div>
            </div>

            {/* Time Taken */}
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-8">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Time taken: {formatTime(result.timeTaken)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {quizSession && result.answers.length > 0 && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowAnswers(!showAnswers)}
                  className="min-w-[200px]"
                >
                  {showAnswers ? 'Hide Answers' : 'Review Answers'}
                </Button>
              )}
              <Button
                variant="primary"
                size="lg"
                onClick={handleBackToHome}
                className="min-w-[200px]"
              >
                Back to Home
              </Button>
            </div>
          </div>

          {/* Answer Review Section */}
          {showAnswers && quizSession && result.answers.length > 0 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Answer Review
                </h2>
                <p className="text-gray-600 mb-6">
                  Review your answers below. Correct answers are highlighted in green, 
                  and incorrect answers are highlighted in red.
                </p>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      {result.score}
                    </div>
                    <div className="text-sm text-green-600">Correct</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="text-2xl font-bold text-red-700">
                      {result.totalQuestions - result.score}
                    </div>
                    <div className="text-sm text-red-600">Incorrect</div>
                  </div>
                </div>
              </div>

              {/* Question Cards */}
              {quizSession.questions.map((question, index) => {
                const answer = result.answers.find(a => a.questionId === question._id);
                
                if (!answer) return null;

                return (
                  <div 
                    key={question._id} 
                    className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                      answer.isCorrect ? 'border-green-500' : 'border-red-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      {answer.isCorrect ? (
                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>Correct</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-700 font-semibold">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>Incorrect</span>
                        </div>
                      )}
                    </div>

                    {/* Display question with selected answer highlighted */}
                    <div className="w-full max-w-3xl mx-auto">
                      <div className="mb-6">
                        <div className="text-sm font-medium text-gray-500 mb-2">
                          Question {index + 1} of {quizSession.questions.length}
                        </div>
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
                          {question.question}
                        </h2>
                      </div>

                      <div className="space-y-3">
                        {question.options.map((option, optIndex) => {
                          const isSelected = answer.selectedAnswer === optIndex;
                          const isCorrectAnswer = isSelected && answer.isCorrect;
                          const isWrongAnswer = isSelected && !answer.isCorrect;
                          
                          const optionLabel = ['A', 'B', 'C', 'D'][optIndex] || String.fromCharCode(65 + optIndex);
                          
                          let optionStyles = 'w-full text-left p-4 rounded-lg border-2 transition-all duration-200';
                          
                          if (isCorrectAnswer) {
                            optionStyles += ' bg-green-50 border-green-500 text-green-900 font-medium';
                          } else if (isWrongAnswer) {
                            optionStyles += ' bg-red-50 border-red-500 text-red-900';
                          } else {
                            optionStyles += ' bg-gray-50 border-gray-200 text-gray-700';
                          }

                          return (
                            <div key={optIndex} className={optionStyles}>
                              <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                                  {optionLabel}
                                </span>
                                <span className="flex-1 text-base md:text-lg pt-1">
                                  {option}
                                </span>
                                {isCorrectAnswer && (
                                  <svg
                                    className="flex-shrink-0 w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                                {isWrongAnswer && (
                                  <svg
                                    className="flex-shrink-0 w-6 h-6 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {!answer.isCorrect && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <span className="font-semibold">Note:</span> The correct answer is not shown to maintain quiz integrity. 
                            Your selected answer is highlighted in red.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
