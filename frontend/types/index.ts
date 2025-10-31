// types/index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'teacher';
}

export interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  _id: string;
  title: string;
  teacher: string;
  accessCode: string;
  questions: Question[];
  questionsPerStudent: number;
  duration: number; // in minutes
  expiresAt: string;
  status: 'active' | 'expired' | 'draft';
  sourceContent?: string;
  submissionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizInfo {
  _id: string;
  title: string;
  duration: number;
  questionsPerStudent: number;
  expiresAt: string;
  status: string;
}

export interface QuizSession {
  quizId: string;
  title: string;
  duration: number;
  questions: {
    _id: string;
    question: string;
    options: string[];
  }[];
}

export interface Answer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface Submission {
  _id: string;
  quiz: string;
  studentName: string;
  studentId: string;
  answers: Answer[];
  score: number;
  totalQuestions: number;
  timeTaken?: number;
  submittedAt: string;
}

export interface Analytics {
  totalSubmissions: number;
  averageScore: string | number;
  highestScore: number;
  lowestScore: number;
  totalQuestions: number;
  submissions: Array<{
    studentName: string;
    studentId: string;
    score: number;
    totalQuestions?: number;
    percentage: string;
    timeTaken: number;
    submittedAt: string;
  }>;
  questionStats?: {
    questionId: string;
    question: string;
    correctCount: number;
    totalAttempts: number;
    accuracyRate: number;
  }[];
}

export interface SubmissionData {
  quizId: string;
  studentName: string;
  studentId: string;
  answers: {
    questionId: string;
    selectedAnswer: number;
  }[];
  timeTaken: number;
}

export interface SubmissionResult {
  score: number;
  totalQuestions: number;
  answers: Answer[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface APIError {
  message: string;
  status?: number;
}
