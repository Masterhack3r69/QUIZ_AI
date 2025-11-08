'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/contexts/ToastContext';
import Timer from '@/components/quiz/Timer';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import type { Question, QuestionType } from '@/types';

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
      return '✓✗';
    case 'fillInBlank':
      return '___';
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
  const { showError, showWarning, showSuccess } = useToast();

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading quiz...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Quiz Title and Student Info */}
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {quizSession.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {[studentInfo.firstName, studentInfo.middleName, studentInfo.lastName, studentInfo.suffix].filter(Boolean).join(' ')}
                {studentInfo.studentId && ` (${studentInfo.studentId})`}
              </p>
            </div>
            
            {/* Timer */}
            <Timer
              duration={durationInSeconds}
              onExpire={handleTimerExpire}
              isActive={!isSubmitting}
            />
          </div>

          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-medium">
                  Question {currentQuestionIndex + 1} of {quizSession.questions.length}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {getQuestionTypeIcon(currentQuestion.type)} {getQuestionTypeLabel(currentQuestion.type)}
                </Badge>
              </div>
              <span className="text-center sm:text-right">
                {answeredCount} / {quizSession.questions.length} answered
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Question {currentQuestionIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionCard
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                onSelectAnswer={handleSelectAnswer}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={quizSession.questions.length}
              />
            </CardContent>
          </Card>

          {/* Question Navigation Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {quizSession.questions.map((q, index) => {
                  const isAnswered = isQuestionAnswered(q);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      disabled={isSubmitting}
                      title={`Question ${index + 1}: ${getQuestionTypeLabel(q.type)}${isAnswered ? ' (answered)' : ''}`}
                      className={`
                        aspect-square rounded-lg font-semibold text-sm relative
                        transition-all duration-200 min-h-[44px] min-w-[44px]
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                        ${isCurrent
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                          : isAnswered
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      aria-label={`Go to question ${index + 1}: ${getQuestionTypeLabel(q.type)}${isAnswered ? ' (answered)' : ''}`}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <span className="block">{index + 1}</span>
                      <span className="absolute -top-1 -right-1 text-xs opacity-60">
                        {getQuestionTypeIcon(q.type)}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded dark:bg-green-900/30"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted border border-border rounded"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Fixed Footer with Navigation */}
      <footer className="sticky bottom-0 z-50 bg-white border-t shadow-lg dark:bg-gray-950 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="flex-1 min-h-[48px] touch-manipulation"
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
                className="flex-1 min-h-[48px] touch-manipulation"
              >
                Next
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleManualSubmit}
                disabled={!allAnswered || isSubmitting}
                className="flex-1 min-h-[48px] touch-manipulation"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            )}
          </div>

          {/* Submit button hint */}
          {!allAnswered && currentQuestionIndex === quizSession.questions.length - 1 && (
            <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3 text-xs sm:text-sm text-amber-600 dark:text-amber-500">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-center">Please answer all questions to enable submission</span>
            </div>
          )}
        </div>
      </footer>

      {/* Auto-Submit Alert Dialog */}
      <AlertDialog open={showAutoSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Time's Up!
            </AlertDialogTitle>
            <AlertDialogDescription>
              The quiz time has expired. Your answers are being submitted automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction disabled>
              Submitting...
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
