import api from '@/lib/api';

export interface QuizValidation {
  _id: string;
  title: string;
  duration: number;
  questionsPerStudent: number;
  expiresAt: string;
  startDate?: string;
  maxStudents?: number;
  currentSubmissions?: number;
  studentInfoRequirements: {
    firstName: boolean;
    middleName: boolean;
    lastName: boolean;
    suffix: boolean;
    studentId: boolean;
    course: boolean;
    year: boolean;
    section: boolean;
    email: boolean;
  };
}

export interface QuizQuestion {
  _id: string;
  type: 'multipleChoice' | 'trueFalse' | 'fillInBlank' | 'matching';
  question: string;
  options?: string[];
  leftColumn?: string[];
  rightColumn?: string[];
  caseSensitive?: boolean;
}

export interface QuizStart {
  quizId: string;
  title: string;
  duration: number;
  questions: QuizQuestion[];
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

export interface SubmissionAnswer {
  questionId: string;
  questionType: string;
  selectedAnswer: number | boolean | string | { left: number; right: number }[];
}

export interface SubmissionResult {
  score: number;
  totalQuestions: number;
  submissionId: string;
  answers: {
    questionId: string;
    questionType: string;
    selectedAnswer: any;
    isCorrect: boolean;
  }[];
}

export const studentService = {
  // Validate quiz code
  validateQuizCode: async (accessCode: string): Promise<QuizValidation> => {
    const response = await api.post<QuizValidation>('/quiz/validate', { 
      accessCode: accessCode.toUpperCase() 
    });
    return response.data;
  },

  // Start quiz and get questions
  startQuiz: async (accessCode: string): Promise<QuizStart> => {
    const response = await api.post<QuizStart>('/quiz/start', { 
      accessCode: accessCode.toUpperCase() 
    });
    return response.data;
  },

  // Submit quiz answers
  submitQuiz: async (
    quizId: string, 
    studentInfo: StudentInfo, 
    answers: SubmissionAnswer[], 
    timeTaken: number
  ): Promise<SubmissionResult> => {
    const response = await api.post<SubmissionResult>('/submission/submit', {
      quizId,
      studentInfo,
      answers,
      timeTaken
    });
    return response.data;
  }
};
