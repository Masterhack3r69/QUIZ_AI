import api from '@/lib/api';

export const aiService = {
  processVideo: async (videoUrl: string) => {
    const response = await api.post('/quiz/process-video', { videoUrl });
    return response.data; // { content, contentLength }
  },

  processUrl: async (webUrl: string) => {
    const response = await api.post('/quiz/process-url', { webUrl });
    return response.data;
  },

  processTopic: async (topicText: string) => {
    const response = await api.post('/quiz/process-topic', { topicText });
    return response.data;
  },

  generateQuestions: async (payload: {
    content: string;
    questionDistribution: Record<string, number>;
    totalQuestions: number;
    difficulty: string;
  }) => {
    const response = await api.post('/quiz/generate-questions', payload);
    return response.data; // { questions, questionCount }
  },

  createQuiz: async (payload: any) => {
    const response = await api.post('/quiz/create', payload);
    return response.data;
  }
};
