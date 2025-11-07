// types/index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'teacher';
}

// ==================== Question Types ====================

export type QuestionType = 'multipleChoice' | 'trueFalse' | 'fillInBlank' | 'matching';

export interface BaseQuestion {
  _id: string;
  type: QuestionType;
  question: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multipleChoice';
  options: string[];
  correctAnswer: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'trueFalse';
  correctAnswer: boolean;
}

export interface FillInBlankQuestion extends BaseQuestion {
  type: 'fillInBlank';
  correctAnswer: string;
  caseSensitive?: boolean;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  leftColumn: string[];
  rightColumn: string[];
  correctPairs: { left: number; right: number }[];
}

export type Question = 
  | MultipleChoiceQuestion 
  | TrueFalseQuestion 
  | FillInBlankQuestion 
  | MatchingQuestion;

// Legacy type for backward compatibility
export interface LegacyQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

// ==================== Quiz Distribution ====================

export interface QuizDistribution {
  multipleChoice: number;
  trueFalse: number;
  fillInBlank: number;
  matching: number;
}

// ==================== Quiz Types ====================

export interface Quiz {
  _id: string;
  title: string;
  teacher: string;
  accessCode: string;
  questions: Question[];
  questionsPerStudent: number;
  questionDistribution: QuizDistribution;
  duration: number; // in minutes
  startDate?: string;
  expiresAt: string;
  maxStudents?: number;
  subjects: string[];
  status: 'scheduled' | 'active' | 'full' | 'expired' | 'draft';
  sourceContent?: {
    type: 'file' | 'topic' | 'video' | 'url';
    content: string;
  };
  submissionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizTemplate {
  _id: string;
  teacher: string;
  name: string;
  type: 'short' | 'long' | 'exam' | 'custom';
  questionCount: number;
  duration: number;
  questionDistribution: QuizDistribution;
  expirationPeriod: number; // in days
  subjects?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentInfoRequirements {
  firstName: boolean;
  middleName: boolean;
  lastName: boolean;
  suffix: boolean;
  studentId: boolean;
  course: boolean;
  year: boolean;
  section: boolean;
  email: boolean;
}

export interface StudentInfo {
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

export interface QuizInfo {
  _id: string;
  title: string;
  duration: number;
  questionsPerStudent: number;
  startDate?: string;
  expiresAt: string;
  maxStudents?: number;
  currentSubmissions: number;
  status: 'scheduled' | 'active' | 'full' | 'expired';
  studentInfoRequirements?: StudentInfoRequirements;
}

export interface QuizSession {
  quizId: string;
  title: string;
  duration: number;
  questions: Omit<Question, 'correctAnswer' | 'correctPairs'>[];
}

// ==================== Answer Types ====================

export interface Answer {
  questionId: string;
  questionType: QuestionType;
  selectedAnswer: number | boolean | string | { left: number; right: number }[];
  isCorrect: boolean;
}

export interface Submission {
  _id: string;
  quiz: string;
  studentName: string;
  studentId: string;
  studentInfo?: StudentInfo;
  answers: Answer[];
  score: number;
  totalQuestions: number;
  timeTaken?: number;
  submittedAt: string;
}

// ==================== Analytics Types ====================

export interface Analytics {
  summary: {
    totalSubmissions: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    questionTypeBreakdown?: {
      multipleChoice: number;
      trueFalse: number;
      fillInBlank: number;
      matching: number;
    };
    averageScoreByType?: {
      multipleChoice: number;
      trueFalse: number;
      fillInBlank: number;
      matching: number;
    };
  };
  submissions: Submission[];
  questionStats: {
    questionId: string;
    question: string;
    questionType: QuestionType;
    correctCount: number;
    totalAttempts: number;
    accuracyRate: number;
  }[];
}

// ==================== Submission Types ====================

export interface SubmissionData {
  quizId: string;
  studentInfo: StudentInfo;
  answers: {
    questionId: string;
    questionType: QuestionType;
    selectedAnswer: number | boolean | string | { left: number; right: number }[];
  }[];
  timeTaken: number;
}

export interface SubmissionResult {
  score: number;
  totalQuestions: number;
  answers: Answer[];
}

// ==================== API Types ====================

export interface AuthResponse {
  token: string;
  user: User;
}

export interface APIError {
  message: string;
  status?: number;
}

// ==================== Content Source Types ====================

export interface ContentSource {
  type: 'file' | 'topic' | 'video' | 'url';
  content: File | string;
}

// ==================== Quiz Creation Types ====================

export interface CreateQuizData {
  title: string;
  sourceType: 'file' | 'topic' | 'video' | 'url';
  sourceContent: string | File;
  templateId?: string;
  questionCount: number;
  questionDistribution: QuizDistribution;
  duration: number;
  startDate?: string;
  expiresAt: string;
  maxStudents?: number;
  subjects: string[];
}

export interface QuizFilters {
  status?: 'scheduled' | 'active' | 'full' | 'expired';
  subject?: string;
  startDate?: string;
  endDate?: string;
}
