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
  questions: any[]; // We might not get full questions in list view
  accessCode: string;
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
  }
};
