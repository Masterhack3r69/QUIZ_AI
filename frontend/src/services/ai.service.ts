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

  processFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/quiz/process-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  generateQuestions: async (payload: {
    content: string;
    questionDistribution: Record<string, number>;
    totalQuestions: number;
    difficulty: string;
    targetLanguage?: string;
  }) => {
    const response = await api.post('/quiz/generate-questions', payload);
    return response.data; // { questions, questionCount, targetLanguage }
  },

  createQuiz: async (payload: any) => {
    const response = await api.post('/quiz/create', payload);
    return response.data;
  }
};
