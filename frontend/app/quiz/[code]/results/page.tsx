'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { CheckCircle2, XCircle, Clock, Trophy, Target, TrendingUp } from 'lucide-react';
import type { Answer, Question } from '@/types';

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
  questions: Question[];
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const accessCode = params.code as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [quizSession, setQuizSession] = useState<QuizSessionData | null>(null);

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

  const handleExit = () => {
    // Clear all quiz-related session data
    sessionStorage.removeItem('quizResult');
    sessionStorage.removeItem('quizSession');
    sessionStorage.removeItem('studentInfo');
    sessionStorage.removeItem('quizAnswers');
    sessionStorage.removeItem('currentQuestionIndex');
    sessionStorage.removeItem('quiz_timer_state');
    
    router.push('/join');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getEncouragingMessage = (percentage: number): { message: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    if (percentage >= 90) return { message: 'Outstanding!', variant: 'default' };
    if (percentage >= 80) return { message: 'Excellent!', variant: 'default' };
    if (percentage >= 70) return { message: 'Great Job!', variant: 'default' };
    if (percentage >= 60) return { message: 'Good Work!', variant: 'secondary' };
    if (percentage >= 50) return { message: 'Keep Practicing!', variant: 'secondary' };
    return { message: 'Keep Trying!', variant: 'outline' };
  };

  if (!result) {
    return (
      <PublicLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading results...</p>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const encouragement = getEncouragingMessage(percentage);
  const isPassing = percentage >= 60;

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Results Card */}
          <Card className="text-center">
            <CardContent className="pt-8 pb-6">
              {/* Celebratory Icon */}
              <div className="flex justify-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  isPassing 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-amber-100 dark:bg-amber-900/30'
                }`}>
                  {isPassing ? (
                    <Trophy className="w-12 h-12 text-green-600 dark:text-green-400" />
                  ) : (
                    <Target className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
              </div>

              {/* Completion Message */}
              <div className="mb-8">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-3">
                  {result.isAutoSubmit ? "Time's Up!" : 'Quiz Completed!'}
                </h1>
                <p className="text-xl text-muted-foreground mb-4">
                  {isPassing 
                    ? 'Great job! You passed the quiz.' 
                    : 'Keep practicing to improve your score.'}
                </p>
                <Badge variant={encouragement.variant} className="text-base px-4 py-1">
                  {encouragement.message}
                </Badge>
              </div>

              {/* Large Score Display */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-8 mb-6 border">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {result.score}/{result.totalQuestions}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground">
                    {percentage}%
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    You answered {result.score} out of {result.totalQuestions} questions correctly
                  </p>
                </div>
              </div>

              {/* Progress Bar Visualization */}
              <div className="mb-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Correct: {result.score}
                  </span>
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                    <XCircle className="w-4 h-4" />
                    Incorrect: {result.totalQuestions - result.score}
                  </span>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>

              {/* Time Taken */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
                <Clock className="w-5 h-5" />
                <span className="text-base">Time taken: {formatTime(result.timeTaken)}</span>
              </div>

              {/* Action Button */}
              <Button
                size="lg"
                onClick={handleExit}
                className="min-w-[200px]"
              >
                Exit Quiz
              </Button>
            </CardContent>
          </Card>

          {/* Question Review Section (Accordion) */}
          {quizSession && result.answers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Review Your Answers
                </CardTitle>
                <CardDescription>
                  Expand each question to see your answer and the correct answer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {result.score}
                      </div>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-500">Correct Answers</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {result.totalQuestions - result.score}
                      </div>
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-500">Incorrect Answers</div>
                  </div>
                </div>

                {/* Accordion for Questions */}
                <Accordion type="single" collapsible className="w-full">
                  {quizSession.questions.map((question, index) => {
                    const answer = result.answers.find(a => a.questionId === question._id);
                    
                    if (!answer) return null;

                    return (
                      <AccordionItem key={question._id} value={`question-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              answer.isCorrect 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              {answer.isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Question {index + 1}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {question.question}
                              </div>
                            </div>
                            <Badge 
                              variant={answer.isCorrect ? 'default' : 'destructive'}
                              className="ml-2"
                            >
                              {answer.isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-4">
                            <QuestionCard
                              question={question}
                              selectedAnswer={answer.selectedAnswer}
                              onSelectAnswer={() => {}} // No-op in review mode
                              questionNumber={index + 1}
                              totalQuestions={quizSession.questions.length}
                              showCorrectAnswer={true}
                              isReview={true}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
