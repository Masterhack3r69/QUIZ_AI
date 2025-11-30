import { create } from 'zustand';

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-in-the-blank' | 'short-answer';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export interface Question {
  id: string; // Temporary ID for frontend management
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface QuizState {
  // Step 1: Source
  sourceType: 'topic' | 'text' | 'file' | 'url' | 'video' | null;
  sourceContent: string | File | null;
  sourceMetadata: {
    filename?: string;
    url?: string;
    processedContent?: string; // The extracted text from backend
  };

  // Step 2: Configuration
  config: {
    questionCount: number;
    difficulty: Difficulty;
    distribution: Record<QuestionType, number>; // e.g., { 'multiple-choice': 5, 'true-false': 5 }
  };

  // Step 3: Generation & Review
  questions: Question[];
  isGenerating: boolean;

  // Step 4: Final Details
  details: {
    title: string;
    description: string;
    duration: number; // in minutes
    expiresAt?: Date;
  };

  // Actions
  setSource: (type: QuizState['sourceType'], content: string | File, metadata?: any) => void;
  setConfig: (config: Partial<QuizState['config']>) => void;
  setQuestions: (questions: Question[]) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  addQuestion: (question: Question) => void;
  setDetails: (details: Partial<QuizState['details']>) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  sourceType: null,
  sourceContent: null,
  sourceMetadata: {},

  config: {
    questionCount: 10,
    difficulty: 'medium',
    distribution: {
      'multiple-choice': 10,
      'true-false': 0,
      'fill-in-the-blank': 0,
      'short-answer': 0,
    },
  },

  questions: [],
  isGenerating: false,

  details: {
    title: '',
    description: '',
    duration: 30,
  },

  setSource: (type, content, metadata = {}) => set({ 
    sourceType: type, 
    sourceContent: content, 
    sourceMetadata: metadata 
  }),

  setConfig: (newConfig) => set((state) => ({ 
    config: { ...state.config, ...newConfig } 
  })),

  setQuestions: (questions) => set({ questions }),

  updateQuestion: (id, updates) => set((state) => ({
    questions: state.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
  })),

  deleteQuestion: (id) => set((state) => ({
    questions: state.questions.filter((q) => q.id !== id),
  })),

  addQuestion: (question) => set((state) => ({
    questions: [...state.questions, question],
  })),

  setDetails: (newDetails) => set((state) => ({
    details: { ...state.details, ...newDetails }
  })),

  reset: () => set({
    sourceType: null,
    sourceContent: null,
    sourceMetadata: {},
    config: {
      questionCount: 10,
      difficulty: 'medium',
      distribution: {
        'multiple-choice': 10,
        'true-false': 0,
        'fill-in-the-blank': 0,
        'short-answer': 0,
      },
    },
    questions: [],
    isGenerating: false,
    details: {
      title: '',
      description: '',
      duration: 30,
    },
  }),
}));
