'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui';
import Timer from '@/components/quiz/Timer';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { Toast } from '@/components/ui/Toast';

interface QuizSessionData {
  quizId: string;
  title: string;
  duration: number; // in minutes
  questions: {
    _id: string;
    question: string;
    options: string[];
  }[];
  startTime: number;
  accessCode: string;
}

interface StudentInfo {
  name: string;
  studentId: string;
}

const QUIZ_SESSION_KEY = 'quizSession';
const ANSWERS_KEY = 'quizAnswers';
const CURRENT_QUESTION_KEY = 'currentQuestionIndex';

export default function QuizTakePage() {
  const params = useParams();
  const router = useRouter();
  const accessCode = params.code as string;

  const [quizSession, setQuizSession] = useState<QuizSessionData | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  
  const hasSubmittedRef = useRef(false);

  // Load quiz session and answers from sessionStorage
  useEffect(() => {
    const sessionStr = sessionStorage.getItem(QUIZ_SESSION_KEY);
    const studentInfoStr = sessionStorage.getItem('studentInfo');
    const answersStr = sessionStorage.getItem(ANSWERS_KEY);
    const currentQuestionStr = sessionStorage.getItem(CURRENT_QUESTION_KEY);

    if (!sessionStr || !studentInfoStr) {
      setToast({ type: 'error', message: 'Quiz session not found. Please start the quiz again.' });
      setTimeout(() => {
        router.push('/join');
      }, 2000);
      return;
    }

    try {
      const session: QuizSessionData = JSON.parse(sessionStr);
      const student: StudentInfo = JSON.parse(studentInfoStr);
      
      setQuizSession(session);
      setStudentInfo(student);

      // Restore saved answers if they exist
      if (answersStr) {
        const savedAnswers = JSON.parse(answersStr);
        setAnswers(new Map(Object.entries(savedAnswers)));
      }

      // Restore current question index if it exists
      if (currentQuestionStr) {
        const savedIndex = parseInt(currentQuestionStr, 10);
        if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < session.questions.length) {
          setCurrentQuestionIndex(savedIndex);
        }
      }
    } catch (error) {
      console.error('Error parsing session data:', error);
      setToast({ type: 'error', message: 'Invalid session data. Please start the quiz again.' });
      setTimeout(() => {
        router.push('/join');
      }, 2000);
    }
  }, [router]);

  // Save answers to sessionStorage whenever they change
  useEffect(() => {
    if (answers.size > 0) {
      const answersObj = Object.fromEntries(answers);
      sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answersObj));
    }
  }, [answers]);

  // Save current question index to sessionStorage whenever it changes
  useEffect(() => {
    if (quizSession) {
      sessionStorage.setItem(CURRENT_QUESTION_KEY, currentQuestionIndex.toString());
    }
  }, [currentQuestionIndex, quizSession]);

  // Prevent navigation away from quiz
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasSubmittedRef.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleSelectAnswer = (answerIndex: number) => {
    if (!quizSession) return;
    
    const questionId = quizSession.questions[currentQuestionIndex]._id;
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, answerIndex);
      return newAnswers;
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (quizSession && currentQuestionIndex < quizSession.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const submitQuiz = useCallback(async (isAutoSubmit: boolean = false) => {
    if (hasSubmittedRef.current || !quizSession || !studentInfo) return;
    
    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    try {
      // Calculate time taken
      const timeTaken = Math.floor((Date.now() - quizSession.startTime) / 1000); // in seconds

      // Prepare submission data
      const submissionData = {
        quizId: quizSession.quizId,
        studentName: studentInfo.name,
        studentId: studentInfo.studentId,
        answers: quizSession.questions.map(q => ({
          questionId: q._id,
          selectedAnswer: answers.get(q._id) ?? -1, // -1 for unanswered
        })),
        timeTaken,
      };

      // Submit to backend
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/submission/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to submit quiz: ${response.status}`);
      }

      const result = await response.json();

      // Store result for results page (keep quizSession for answer review)
      sessionStorage.setItem('quizResult', JSON.stringify({
        score: result.score,
        totalQuestions: result.totalQuestions,
        answers: result.answers,
        timeTaken,
        isAutoSubmit,
      }));

      // Clear temporary data but keep quizSession for results page
      sessionStorage.removeItem(ANSWERS_KEY);
      sessionStorage.removeItem(CURRENT_QUESTION_KEY);
      sessionStorage.removeItem('quiz_timer_state');

      // Navigate to results page
      router.push(`/quiz/${accessCode}/results`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      hasSubmittedRef.current = false;
      setIsSubmitting(false);
      setToast({ 
        type: 'error', 
        message: 'Failed to submit quiz. Please try again.' 
      });
    }
  }, [quizSession, studentInfo, answers, accessCode, router]);

  const handleTimerExpire = useCallback(() => {
    setToast({ 
      type: 'warning', 
      message: 'Time is up! Submitting your quiz...' 
    });
    submitQuiz(true);
  }, [submitQuiz]);

  const handleManualSubmit = () => {
    if (!quizSession) return;

    // Check if all questions are answered
    const allAnswered = quizSession.questions.every(q => answers.has(q._id));
    
    if (!allAnswered) {
      setToast({ 
        type: 'warning', 
        message: 'Please answer all questions before submitting.' 
      });
      return;
    }

    submitQuiz(false);
  };

  if (!quizSession || !studentInfo) {
    return (
      <PublicLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading quiz...</p>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const currentQuestion = quizSession.questions[currentQuestionIndex];
  const selectedAnswer = answers.get(currentQuestion._id);
  const allAnswered = quizSession.questions.every(q => answers.has(q._id));
  const durationInSeconds = quizSession.duration * 60;

  return (
    <PublicLayout>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with Timer */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  {quizSession.title}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {studentInfo.name} ({studentInfo.studentId})
                </p>
              </div>
              
              <Timer
                duration={durationInSeconds}
                onExpire={handleTimerExpire}
                isActive={!isSubmitting}
              />
            </div>

            {/* Progress Indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>
                  Question {currentQuestionIndex + 1} of {quizSession.questions.length}
                </span>
                <span>
                  {answers.size} / {quizSession.questions.length} answered
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / quizSession.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
            <QuestionCard
              question={currentQuestion.question}
              options={currentQuestion.options}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={quizSession.questions.length}
            />
          </div>

          {/* Navigation and Submit */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Previous Button */}
              <Button
                variant="secondary"
                size="lg"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0 || isSubmitting}
                className="flex-1"
              >
                ← Previous
              </Button>

              {/* Next or Submit Button */}
              {currentQuestionIndex < quizSession.questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Next →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleManualSubmit}
                  disabled={!allAnswered || isSubmitting}
                  loading={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              )}
            </div>

            {/* Submit button hint */}
            {!allAnswered && currentQuestionIndex === quizSession.questions.length - 1 && (
              <p className="text-sm text-amber-600 mt-4 text-center">
                ⚠️ Please answer all questions to enable submission
              </p>
            )}
          </div>

          {/* Question Navigation Grid */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Question Navigator
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {quizSession.questions.map((q, index) => {
                const isAnswered = answers.has(q._id);
                const isCurrent = index === currentQuestionIndex;
                
                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    disabled={isSubmitting}
                    className={`
                      aspect-square rounded-lg font-semibold text-sm
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${isCurrent
                        ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                        : isAnswered
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    aria-label={`Go to question ${index + 1}${isAnswered ? ' (answered)' : ''}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
