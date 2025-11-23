'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/contexts/ToastContext';
import Timer from '@/components/quiz/Timer';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { Clock, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import type { Question, QuestionType } from '@/types';
import { motion, AnimatePresence } from 'motion/react';

interface QuizSessionData {
  quizId: string;
  title: string;
  duration: number; // in minutes
  questions: Question[];
  startTime: number;
  accessCode: string;
}

interface StudentInfo {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  studentId?: string;
  course?: string;
  year?: string;
  section?: string;
  email?: string;
}

const QUIZ_SESSION_KEY = 'quizSession';
const ANSWERS_KEY = 'quizAnswers';
const CURRENT_QUESTION_KEY = 'currentQuestionIndex';

// Helper function to get default answer for unanswered questions
const getDefaultAnswer = (questionType: QuestionType): number | boolean | string | { left: number; right: number }[] => {
  switch (questionType) {
    case 'multipleChoice':
      return -1; // -1 indicates no answer selected
    case 'trueFalse':
      return false; // Default to false (could also be null, but backend expects boolean)
    case 'fillInBlank':
      return ''; // Empty string for no answer
    case 'matching':
      return []; // Empty array for no pairs
    default:
      return -1;
  }
};

// Helper function to get readable question type label
const getQuestionTypeLabel = (questionType: QuestionType): string => {
  switch (questionType) {
    case 'multipleChoice':
      return 'Multiple Choice';
    case 'trueFalse':
      return 'True/False';
    case 'fillInBlank':
      return 'Fill in Blank';
    case 'matching':
      return 'Matching';
    default:
      return 'Unknown';
  }
};

// Helper function to get question type icon
const getQuestionTypeIcon = (questionType: QuestionType): string => {
  switch (questionType) {
    case 'multipleChoice':
      return '◉';
    case 'trueFalse':
      return '✓';
    case 'fillInBlank':
      return '✎';
    case 'matching':
      return '⇄';
    default:
      return '?';
  }
};

export default function QuizTakePage() {
  const params = useParams();
  const router = useRouter();
  const accessCode = params.code as string;
  const { showError, showWarning } = useToast();

  const [quizSession, setQuizSession] = useState<QuizSessionData | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number | boolean | string | { left: number; right: number }[]>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAutoSubmitDialog, setShowAutoSubmitDialog] = useState(false);
  
  const hasSubmittedRef = useRef(false);

  // Load quiz session and answers from sessionStorage
  useEffect(() => {
    const sessionStr = sessionStorage.getItem(QUIZ_SESSION_KEY);
    const studentInfoStr = sessionStorage.getItem('studentInfo');
    const answersStr = sessionStorage.getItem(ANSWERS_KEY);
    const currentQuestionStr = sessionStorage.getItem(CURRENT_QUESTION_KEY);

    if (!sessionStr || !studentInfoStr) {
      showError('Quiz session not found. Please start the quiz again.');
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
      showError('Invalid session data. Please start the quiz again.');
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

  const handleSelectAnswer = (answer: number | boolean | string | { left: number; right: number }[]) => {
    if (!quizSession) return;
    
    const questionId = quizSession.questions[currentQuestionIndex]._id;
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, answer);
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

      // Prepare submission data with new studentInfo structure
      const submissionData = {
        quizId: quizSession.quizId,
        studentInfo: studentInfo, // Now contains the full student info object
        answers: quizSession.questions.map(q => ({
          questionId: q._id,
          questionType: q.type,
          selectedAnswer: answers.get(q._id) ?? getDefaultAnswer(q.type),
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
      showError('Failed to submit quiz. Please try again.');
    }
  }, [quizSession, studentInfo, answers, accessCode, router, showError]);

  const handleTimerExpire = useCallback(() => {
    setShowAutoSubmitDialog(true);
    // Auto-submit after showing dialog
    setTimeout(() => {
      submitQuiz(true);
    }, 2000);
  }, [submitQuiz]);

  const isQuestionAnswered = (question: Question): boolean => {
    const answer = answers.get(question._id);
    if (answer === undefined) return false;

    switch (question.type) {
      case 'multipleChoice':
        return typeof answer === 'number' && answer >= 0;
      case 'trueFalse':
        return typeof answer === 'boolean';
      case 'fillInBlank':
        return typeof answer === 'string' && answer.trim().length > 0;
      case 'matching':
        return Array.isArray(answer) && answer.length === question.leftColumn.length;
      default:
        return false;
    }
  };

  const handleManualSubmit = () => {
    if (!quizSession) return;

    // Check if all questions are answered
    const allAnswered = quizSession.questions.every(q => isQuestionAnswered(q));
    
    if (!allAnswered) {
      showWarning('Please answer all questions before submitting.');
      return;
    }

    submitQuiz(false);
  };

  if (!quizSession || !studentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-6"></div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading your quiz...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quizSession.questions[currentQuestionIndex];
  const selectedAnswer = answers.get(currentQuestion._id);
  const allAnswered = quizSession.questions.every(q => isQuestionAnswered(q));
  const durationInSeconds = quizSession.duration * 60;
  const progressPercentage = ((currentQuestionIndex + 1) / quizSession.questions.length) * 100;
  const answeredCount = quizSession.questions.filter(q => isQuestionAnswered(q)).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Quiz Title and Student Info */}
            <div className="text-center md:text-left flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                {quizSession.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {[studentInfo.firstName, studentInfo.middleName, studentInfo.lastName, studentInfo.suffix].filter(Boolean).join(' ')}
                {studentInfo.studentId && ` • ${studentInfo.studentId}`}
              </p>
            </div>
            
            {/* Timer */}
            <div className="flex-shrink-0">
              <Timer
                duration={durationInSeconds}
                onExpire={handleTimerExpire}
                isActive={!isSubmitting}
              />
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 px-2 py-0.5 rounded-full">
                  Q{currentQuestionIndex + 1}
                </Badge>
                <span className="hidden sm:inline text-gray-400">|</span>
                <span className="uppercase tracking-wide text-[10px] sm:text-xs">
                  {getQuestionTypeLabel(currentQuestion.type)}
                </span>
              </span>
              <span>
                {answeredCount} of {quizSession.questions.length} Answered
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 pb-6">
                  <CardTitle className="text-xl md:text-2xl font-bold leading-relaxed text-gray-800 dark:text-gray-100 flex gap-4">
                    <span className="flex-shrink-0 text-blue-500/20 select-none text-4xl font-black -mt-1">
                      {currentQuestionIndex + 1}
                    </span>
                    <span>
                      Question Text Placeholder
                      {/* Note: The QuestionCard component handles rendering the actual question text. 
                          We are wrapping it here for layout. */}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <QuestionCard
                    question={currentQuestion}
                    selectedAnswer={selectedAnswer}
                    onSelectAnswer={handleSelectAnswer}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={quizSession.questions.length}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Question Navigation Grid */}
          <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Question Navigator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {quizSession.questions.map((q, index) => {
                  const isAnswered = isQuestionAnswered(q);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <motion.button
                      key={q._id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentQuestionIndex(index)}
                      disabled={isSubmitting}
                      title={`Question ${index + 1}: ${getQuestionTypeLabel(q.type)}${isAnswered ? ' (answered)' : ''}`}
                      className={`
                        aspect-square rounded-xl font-bold text-sm relative
                        transition-all duration-200 flex items-center justify-center
                        ${isCurrent
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 border-2 border-transparent'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 border-2 border-transparent'
                        }
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {index + 1}
                      {isAnswered && !isCurrent && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Fixed Footer with Navigation */}
      <footer className="sticky bottom-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="flex-1 h-12 text-base font-medium rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>

            {/* Next or Submit Button */}
            {currentQuestionIndex < quizSession.questions.length - 1 ? (
              <Button
                size="lg"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex-1 h-12 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30"
              >
                Next
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleManualSubmit}
                disabled={!allAnswered || isSubmitting}
                className={`
                  flex-1 h-12 text-base font-bold rounded-xl shadow-lg transition-all
                  ${allAnswered 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:shadow-emerald-500/30' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Quiz'
                )}
              </Button>
            )}
          </div>

          {/* Submit button hint */}
          {!allAnswered && currentQuestionIndex === quizSession.questions.length - 1 && (
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-amber-600 dark:text-amber-500 font-medium animate-pulse">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Please answer all questions to submit</span>
            </div>
          )}
        </div>
      </footer>

      {/* Auto-Submit Alert Dialog */}
      <AlertDialog open={showAutoSubmitDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-6 w-6 text-amber-600" />
              Time's Up!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              The quiz time has expired. Your answers are being submitted automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction disabled className="w-full sm:w-auto rounded-xl">
              Submitting...
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
