'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export interface QuestionAnalytics {
  questionNumber: number;
  questionText: string;
  correctCount: number;
  totalAttempts: number;
  accuracyRate: number;
}

export interface AnalyticsChartProps {
  data: QuestionAnalytics[];
  highlightThreshold?: number; // Highlight questions below this accuracy rate
}

export function AnalyticsChart({ 
  data, 
  highlightThreshold = 50 
}: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Question Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No data available yet. Analytics will appear once students submit their quizzes.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by accuracy rate to identify most missed questions
  const sortedData = [...data].sort((a, b) => a.accuracyRate - b.accuracyRate);
  const mostMissedQuestions = sortedData.filter(q => q.accuracyRate < highlightThreshold);

  const getAccuracyColor = (rate: number): string => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (rate: number): string => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Question Analytics</CardTitle>
          <p className="text-sm text-muted-foreground">
            Accuracy rates for each question across all submissions
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.map((question) => {
              const isMostMissed = question.accuracyRate < highlightThreshold;
              
              return (
                <div 
                  key={question.questionNumber}
                  className={`
                    p-4 rounded-lg border transition-colors
                    ${isMostMissed ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}
                  `}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-700">
                          Question {question.questionNumber}
                        </span>
                        {isMostMissed && (
                          <Badge variant="destructive" className="text-xs">
                            Most Missed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {question.questionText}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className={`text-2xl font-bold ${getAccuracyColor(question.accuracyRate)}`}>
                        {question.accuracyRate.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {question.correctCount}/{question.totalAttempts}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={question.accuracyRate} 
                      className="h-2"
                    />
                    <div 
                      className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(question.accuracyRate)}`}
                      style={{ width: `${question.accuracyRate}%` }}
                    />
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Correct: {question.correctCount}</span>
                    <span>Incorrect: {question.totalAttempts - question.correctCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {mostMissedQuestions.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">
              Most Missed Questions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Questions with accuracy below {highlightThreshold}% - consider reviewing these topics
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostMissedQuestions.map((question, index) => (
                <div 
                  key={question.questionNumber}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="font-bold">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Question {question.questionNumber}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {question.questionText}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      {question.accuracyRate.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      accuracy
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
