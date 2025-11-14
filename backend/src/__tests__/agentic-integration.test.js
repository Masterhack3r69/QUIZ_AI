import { jest } from '@jest/globals';
import { 
  convertAgenticToQuizFormat, 
  validateQuestionDistribution,
  generateQuestionsWithAgentic 
} from '../utils/agentic-compatibility.js';

describe('Agentic Pipeline Integration', () => {
  describe('convertAgenticToQuizFormat', () => {
    test('should convert agentic result to quiz format', () => {
      const agenticResult = {
        questions: [
          {
            type: 'multipleChoice',
            question: 'What is 2+2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: 1
          },
          {
            type: 'trueFalse',
            question: 'The sky is blue.',
            correctAnswer: true
          }
        ],
        metadata: {
          totalQuestions: 2,
          executionTime: 1000
        }
      };

      const questions = convertAgenticToQuizFormat(agenticResult);

      expect(questions).toHaveLength(2);
      expect(questions[0].type).toBe('multipleChoice');
      expect(questions[0].question).toBe('What is 2+2?');
      expect(questions[0].options).toHaveLength(4);
      expect(questions[0].correctAnswer).toBe(1);
      expect(questions[1].type).toBe('trueFalse');
      expect(questions[1].correctAnswer).toBe(true);
    });

    test('should handle fill-in-blank questions', () => {
      const agenticResult = {
        questions: [
          {
            type: 'fillInBlank',
            question: 'The capital of France is _____.',
            correctAnswer: 'Paris',
            caseSensitive: false
          }
        ]
      };

      const questions = convertAgenticToQuizFormat(agenticResult);

      expect(questions).toHaveLength(1);
      expect(questions[0].type).toBe('fillInBlank');
      expect(questions[0].correctAnswer).toBe('Paris');
      expect(questions[0].caseSensitive).toBe(false);
    });

    test('should handle matching questions', () => {
      const agenticResult = {
        questions: [
          {
            type: 'matching',
            question: 'Match the items:',
            leftColumn: ['A', 'B', 'C', 'D'],
            rightColumn: ['1', '2', '3', '4'],
            correctPairs: [
              { left: 0, right: 1 },
              { left: 1, right: 0 },
              { left: 2, right: 3 },
              { left: 3, right: 2 }
            ]
          }
        ]
      };

      const questions = convertAgenticToQuizFormat(agenticResult);

      expect(questions).toHaveLength(1);
      expect(questions[0].type).toBe('matching');
      expect(questions[0].leftColumn).toHaveLength(4);
      expect(questions[0].rightColumn).toHaveLength(4);
      expect(questions[0].correctPairs).toHaveLength(4);
    });

    test('should filter out invalid questions', () => {
      const agenticResult = {
        questions: [
          {
            type: 'multipleChoice',
            question: 'Valid question?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0
          },
          {
            type: 'multipleChoice',
            question: 'Invalid question?',
            options: ['A', 'B'], // Only 2 options, should be 4
            correctAnswer: 0
          },
          {
            type: 'trueFalse',
            question: 'Another valid question?',
            correctAnswer: true
          }
        ]
      };

      const questions = convertAgenticToQuizFormat(agenticResult);

      expect(questions).toHaveLength(2); // Invalid question filtered out
      expect(questions[0].question).toBe('Valid question?');
      expect(questions[1].question).toBe('Another valid question?');
    });

    test('should throw error for invalid agentic result', () => {
      expect(() => convertAgenticToQuizFormat(null)).toThrow();
      expect(() => convertAgenticToQuizFormat({})).toThrow();
      expect(() => convertAgenticToQuizFormat({ questions: [] })).toThrow();
    });
  });

  describe('validateQuestionDistribution', () => {
    test('should validate matching distribution', () => {
      const questions = [
        { type: 'multipleChoice', question: 'Q1' },
        { type: 'multipleChoice', question: 'Q2' },
        { type: 'trueFalse', question: 'Q3' },
        { type: 'fillInBlank', question: 'Q4' }
      ];

      const requestedDistribution = {
        multipleChoice: 2,
        trueFalse: 1,
        fillInBlank: 1,
        matching: 0
      };

      const result = validateQuestionDistribution(questions, requestedDistribution);

      expect(result.matches).toBe(true);
      expect(result.actual.multipleChoice).toBe(2);
      expect(result.actual.trueFalse).toBe(1);
      expect(result.actual.fillInBlank).toBe(1);
    });

    test('should detect distribution mismatch', () => {
      const questions = [
        { type: 'multipleChoice', question: 'Q1' },
        { type: 'multipleChoice', question: 'Q2' },
        { type: 'multipleChoice', question: 'Q3' },
        { type: 'multipleChoice', question: 'Q4' }
      ];

      const requestedDistribution = {
        multipleChoice: 2,
        trueFalse: 2,
        fillInBlank: 0,
        matching: 0
      };

      const result = validateQuestionDistribution(questions, requestedDistribution);

      expect(result.matches).toBe(false);
      expect(result.actual.multipleChoice).toBe(4);
      expect(result.actual.trueFalse).toBe(0);
    });
  });

  describe('generateQuestionsWithAgentic', () => {
    test('should use fallback when pipeline is null', async () => {
      const fallbackFn = jest.fn().mockResolvedValue([
        { type: 'multipleChoice', question: 'Fallback question' }
      ]);

      const questions = await generateQuestionsWithAgentic(
        null,
        'test content',
        { multipleChoice: 1, trueFalse: 0, fillInBlank: 0, matching: 0 },
        1,
        fallbackFn
      );

      expect(fallbackFn).toHaveBeenCalledWith(
        'test content',
        { multipleChoice: 1, trueFalse: 0, fillInBlank: 0, matching: 0 },
        1
      );
      expect(questions).toHaveLength(1);
      expect(questions[0].question).toBe('Fallback question');
    });

    test('should use agentic pipeline when available', async () => {
      const mockPipeline = {
        generateQuiz: jest.fn().mockResolvedValue({
          questions: [
            {
              type: 'multipleChoice',
              question: 'Agentic question',
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 0
            }
          ],
          metadata: {
            totalQuestions: 1,
            executionTime: 500
          }
        })
      };

      const fallbackFn = jest.fn();

      const questions = await generateQuestionsWithAgentic(
        mockPipeline,
        'test content',
        { multipleChoice: 1, trueFalse: 0, fillInBlank: 0, matching: 0 },
        1,
        fallbackFn
      );

      expect(mockPipeline.generateQuiz).toHaveBeenCalledWith('test content', {
        totalQuestions: 1,
        distribution: { multipleChoice: 1, trueFalse: 0, fillInBlank: 0, matching: 0 },
        difficulty: 'medium'
      });
      expect(fallbackFn).not.toHaveBeenCalled();
      expect(questions).toHaveLength(1);
      expect(questions[0].question).toBe('Agentic question');
    });

    test('should use fallback when agentic pipeline fails', async () => {
      const mockPipeline = {
        generateQuiz: jest.fn().mockRejectedValue(new Error('Pipeline error'))
      };

      const fallbackFn = jest.fn().mockResolvedValue([
        { type: 'multipleChoice', question: 'Fallback question' }
      ]);

      const questions = await generateQuestionsWithAgentic(
        mockPipeline,
        'test content',
        { multipleChoice: 1, trueFalse: 0, fillInBlank: 0, matching: 0 },
        1,
        fallbackFn
      );

      expect(mockPipeline.generateQuiz).toHaveBeenCalled();
      expect(fallbackFn).toHaveBeenCalled();
      expect(questions).toHaveLength(1);
      expect(questions[0].question).toBe('Fallback question');
    });
  });
});
