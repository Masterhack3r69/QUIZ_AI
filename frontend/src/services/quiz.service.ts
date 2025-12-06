import api from '@/lib/api';

export interface Quiz {
  _id: string;
  title: string;
  status: 'active' | 'draft' | 'scheduled' | 'expired' | 'full';
  questionsPerStudent: number;
  duration: number;
  submissionCount: number;
  createdAt: string;
  expiresAt: string;
  startDate?: string;
  maxStudents?: number;
  questions: Question[];
  accessCode: string;
  questionDistribution?: {
    multipleChoice: number;
    trueFalse: number;
    fillInBlank: number;
    matching: number;
  };
  sourceContent?: {
    type: string;
    content: string;
  };
}

export interface Question {
  _id: string;
  type: 'multipleChoice' | 'trueFalse' | 'fillInBlank' | 'matching';
  question: string;
  options?: string[];
  correctAnswer?: number | boolean | string;
  caseSensitive?: boolean;
  leftColumn?: string[];
  rightColumn?: string[];
  correctPairs?: { left: number; right: number }[];
}

export interface QuestionStat {
  questionId: string;
  question: string;
  questionType: string;
  correctCount: number;
  totalAttempts: number;
  accuracyRate: number;
}

export interface SubmissionSummary {
  studentName: string;
  studentId: string;
  studentInfo?: Record<string, string>;
  score: number;
  totalQuestions: number;
  percentage: string;
  timeTaken?: number;
  submittedAt: string;
}

export interface QuizAnalytics {
  summary: {
    totalSubmissions: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    questionTypeBreakdown: {
      multipleChoice: number;
      trueFalse: number;
      fillInBlank: number;
      matching: number;
    };
    averageScoreByType: {
      multipleChoice: number;
      trueFalse: number;
      fillInBlank: number;
      matching: number;
    };
  };
  totalQuestions: number;
  submissions: SubmissionSummary[];
  questionStats: QuestionStat[];
}

export interface AIAnalysis {
  overallInsights: string;
  strengthAreas: string[];
  weaknessAreas: string[];
  recommendations: string[];
  questionAnalysis: {
    questionId: string;
    question: string;
    insight: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
}

export const quizService = {
  getMyQuizzes: async () => {
    const response = await api.get<Quiz[]>('/quiz/my-quizzes');
    return response.data;
  },

  getQuizById: async (id: string) => {
    const response = await api.get<Quiz>(`/quiz/${id}`);
    return response.data;
  },

  deleteQuiz: async (id: string) => {
    const response = await api.delete(`/quiz/${id}`);
    return response.data;
  },

  duplicateQuiz: async (id: string) => {
    const response = await api.post(`/quiz/${id}/duplicate`);
    return response.data;
  },

  getQuizAnalytics: async (id: string) => {
    const response = await api.get<QuizAnalytics>(`/submission/analytics/${id}`);
    return response.data;
  },

  getAIAnalysis: async (id: string) => {
    const response = await api.get<AIAnalysis>(`/quiz/${id}/ai-analysis`);
    return response.data;
  }
};
