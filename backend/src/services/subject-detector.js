/**
 * Subject Detector Service
 * 
 * Analyzes educational content to identify the subject area
 * and recommends the appropriate specialized prompt for question generation.
 */

import PromptManager from './prompt-manager.js';
import aiTaskRouter from './ai-task-router.js';

/**
 * Subject keywords for quick detection
 */
const SUBJECT_KEYWORDS = {
  mathematics: [
    'equation', 'formula', 'calculate', 'solve', 'derivative', 'integral',
    'algebra', 'geometry', 'trigonometry', 'calculus', 'statistics',
    'function', 'graph', 'theorem', 'proof', 'variable', 'polynomial',
    'matrix', 'vector', 'logarithm', 'exponent', 'fraction', 'ratio'
  ],
  science: [
    'experiment', 'hypothesis', 'theory', 'observation', 'data',
    'physics', 'chemistry', 'biology', 'atom', 'molecule', 'cell',
    'energy', 'force', 'reaction', 'organism', 'ecosystem', 'DNA',
    'photosynthesis', 'evolution', 'gravity', 'velocity', 'mass'
  ],
  history: [
    'century', 'war', 'revolution', 'empire', 'civilization', 'ancient',
    'medieval', 'modern', 'dynasty', 'treaty', 'independence', 'colony',
    'president', 'king', 'queen', 'battle', 'conquest', 'reform',
    'renaissance', 'enlightenment', 'industrial revolution'
  ],
  language: [
    'grammar', 'syntax', 'verb', 'noun', 'adjective', 'sentence',
    'paragraph', 'essay', 'literature', 'poem', 'metaphor', 'simile',
    'theme', 'character', 'plot', 'author', 'writing', 'reading',
    'comprehension', 'vocabulary', 'punctuation', 'clause'
  ],
  computer_science: [
    'algorithm', 'code', 'programming', 'function', 'variable', 'loop',
    'array', 'string', 'integer', 'boolean', 'class', 'object',
    'recursion', 'iteration', 'data structure', 'binary', 'syntax',
    'compile', 'debug', 'software', 'hardware', 'database'
  ],
  social_studies: [
    'geography', 'economy', 'government', 'democracy', 'constitution',
    'society', 'culture', 'population', 'trade', 'resources',
    'climate', 'region', 'continent', 'country', 'city', 'map'
  ]
};

/**
 * Prompt mapping for each subject
 */
const SUBJECT_PROMPT_MAP = {
  mathematics: 'math-question-generation',
  science: 'science-question-generation',
  history: 'history-question-generation',
  language: 'language-question-generation',
  computer_science: 'computer-science-question-generation',
  social_studies: 'question-generation', // Use general prompt
  arts: 'question-generation', // Use general prompt
  general: 'question-generation' // Default general prompt
};

/**
 * Subject Detector Class
 */
class SubjectDetector {
  constructor(promptManager = null, taskRouter = null) {
    this.promptManager = promptManager || new PromptManager();
    this.taskRouter = taskRouter || aiTaskRouter;
  }

  /**
   * Detect subject using keyword analysis (fast, no AI call)
   * 
   * @param {string} content - Content to analyze
   * @returns {Object} Detection result with subject and confidence
   */
  detectSubjectByKeywords(content) {
    const lowerContent = content.toLowerCase();
    const scores = {};

    // Count keyword matches for each subject
    for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        // Count occurrences of each keyword
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerContent.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
      scores[subject] = score;
    }

    // Find subject with highest score
    let maxScore = 0;
    let detectedSubject = 'general';
    
    for (const [subject, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedSubject = subject;
      }
    }

    // Calculate confidence (0-1)
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const confidence = totalScore > 0 ? maxScore / totalScore : 0;

    // If confidence is too low, default to general
    if (confidence < 0.3) {
      detectedSubject = 'general';
    }

    return {
      primarySubject: detectedSubject,
      confidence: Math.round(confidence * 100) / 100,
      scores,
      method: 'keyword-analysis',
      recommendedPrompt: SUBJECT_PROMPT_MAP[detectedSubject] || 'question-generation'
    };
  }

  /**
   * Detect subject using AI analysis (accurate, requires AI call)
   * 
   * @param {string} content - Content to analyze
   * @param {Object} options - Options
   * @returns {Promise<Object>} Detection result
   */
  async detectSubjectByAI(content, options = {}) {
    try {
      console.log('[SubjectDetector] Analyzing content with AI...');

      // Truncate content if too long (keep first 2000 chars for analysis)
      const truncatedContent = content.length > 2000 
        ? content.substring(0, 2000) + '...' 
        : content;

      // Get subject detection prompt
      const promptData = this.promptManager.getPrompt('subject-detection', {
        content: truncatedContent
      });

      const fullPrompt = `${promptData.systemPrompt}\n\n${promptData.userPrompt}`;

      // Execute AI task
      const result = await this.taskRouter.executeTask(
        'subject-detection',
        fullPrompt,
        {
          forceProvider: options.forceProvider,
          temperature: 0.3, // Low temperature for consistent classification
          jsonMode: true,
          maxTokens: 1000
        }
      );

      // Parse response
      let detection;
      if (typeof result.text === 'string') {
        detection = JSON.parse(result.text);
      } else {
        detection = result.text;
      }

      console.log('[SubjectDetector] AI detection complete', {
        subject: detection.primarySubject,
        confidence: detection.confidence,
        prompt: detection.recommendedPrompt
      });

      return {
        ...detection,
        method: 'ai-analysis',
        provider: result.provider,
        executionTime: result.executionTime
      };

    } catch (error) {
      console.error('[SubjectDetector] AI detection failed:', error.message);
      
      // Fallback to keyword detection
      console.log('[SubjectDetector] Falling back to keyword detection');
      return this.detectSubjectByKeywords(content);
    }
  }

  /**
   * Detect subject using hybrid approach (keyword first, AI if uncertain)
   * 
   * @param {string} content - Content to analyze
   * @param {Object} options - Options
   * @returns {Promise<Object>} Detection result
   */
  async detectSubject(content, options = {}) {
    // First try keyword detection (fast)
    const keywordResult = this.detectSubjectByKeywords(content);

    console.log('[SubjectDetector] Keyword detection result', {
      subject: keywordResult.primarySubject,
      confidence: keywordResult.confidence
    });

    // If confidence is high enough, use keyword result
    if (keywordResult.confidence >= 0.6) {
      console.log('[SubjectDetector] High confidence, using keyword detection');
      return keywordResult;
    }

    // If confidence is low, use AI for better accuracy
    if (options.useAI !== false) {
      console.log('[SubjectDetector] Low confidence, using AI detection');
      return await this.detectSubjectByAI(content, options);
    }

    // Otherwise return keyword result
    return keywordResult;
  }

  /**
   * Get recommended prompt for a subject
   * 
   * @param {string} subject - Subject name
   * @returns {string} Prompt key
   */
  getRecommendedPrompt(subject) {
    return SUBJECT_PROMPT_MAP[subject] || 'question-generation';
  }

  /**
   * Get subject context string for content extraction
   * 
   * @param {Object} detection - Detection result
   * @returns {string} Subject context description
   */
  getSubjectContext(detection) {
    const contexts = {
      mathematics: 'This is MATHEMATICS content. Focus on problem-solving, calculations, formulas, and mathematical reasoning. Extract concepts that can be tested through computation and application.',
      science: 'This is SCIENCE content. Focus on scientific processes, experiments, cause-and-effect relationships, and application of scientific principles. Extract testable concepts about natural phenomena.',
      history: 'This is HISTORY content. Focus on historical causation, change over time, comparison, and analysis. Extract concepts about events, their causes, effects, and significance.',
      language: 'This is LANGUAGE ARTS content. Focus on grammar application, reading comprehension, literary analysis, and writing mechanics. Extract concepts that test language skills in context.',
      computer_science: 'This is COMPUTER SCIENCE content. Focus on programming logic, algorithms, data structures, and computational thinking. Extract concepts about code behavior and problem-solving.',
      social_studies: 'This is SOCIAL STUDIES content. Focus on geography, economics, government, and society. Extract concepts about human systems and interactions.',
      arts: 'This is ARTS content. Focus on artistic techniques, analysis, and appreciation. Extract concepts about creative expression and interpretation.',
      general: 'This is GENERAL educational content. Extract key concepts that can be tested through various question types.'
    };

    return contexts[detection.primarySubject] || contexts.general;
  }

  /**
   * Format detection result for logging
   * 
   * @param {Object} detection - Detection result
   * @returns {string} Formatted string
   */
  formatDetectionResult(detection) {
    return `Subject: ${detection.primarySubject} (${Math.round(detection.confidence * 100)}% confidence) - Using prompt: ${detection.recommendedPrompt}`;
  }
}

export default SubjectDetector;
export { SUBJECT_KEYWORDS, SUBJECT_PROMPT_MAP };
