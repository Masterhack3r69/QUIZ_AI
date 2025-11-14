/**
 * Question Improvement Agent
 * 
 * Improves low-quality questions based on validation feedback.
 * Applies specific improvements to address identified issues while maintaining
 * the core concept being tested.
 */

import PromptManager from '../prompt-manager.js';
import aiTaskRouter from '../ai-task-router.js';

/**
 * Question Improvement Agent
 * Enhances questions that don't meet quality standards
 */
class QuestionImprovementAgent {
  constructor(taskRouter = null, promptManager = null) {
    this.taskRouter = taskRouter || aiTaskRouter;
    this.promptManager = promptManager || new PromptManager();
  }

  /**
   * Improve a single question based on validation feedback
   * 
   * @param {Object} question - Original question to improve
   * @param {Object} validationFeedback - Quality validation result
   * @param {Object} options - Additional options
   * @param {string} [options.forceProvider] - Force a specific AI provider
   * @param {number} [options.temperature] - Sampling temperature (0-1)
   * @returns {Promise<Object>} Improved question with tracking info
   * @throws {Error} If improvement fails
   */
  async improveQuestion(question, validationFeedback, options = {}) {
    // Validate input
    if (!question || typeof question !== 'object') {
      throw new Error('Question must be a valid object');
    }

    if (!validationFeedback || typeof validationFeedback !== 'object') {
      throw new Error('Validation feedback must be a valid object');
    }

    try {
      // Format original question for prompt
      const formattedQuestion = this.formatQuestionForPrompt(question);
      
      // Format validation feedback for prompt
      const formattedFeedback = this.formatValidationFeedback(validationFeedback);

      console.log(`[QuestionImprovementAgent] Improving question`, {
        questionText: question.question.substring(0, 100),
        originalScore: validationFeedback.score,
        issuesCount: this.countIssues(validationFeedback)
      });

      // Get formatted prompt from prompt manager
      const promptData = this.promptManager.getPrompt('question-improvement', {
        originalQuestion: formattedQuestion,
        validationFeedback: formattedFeedback
      });

      // Build full prompt
      const fullPrompt = `${promptData.systemPrompt}\n\n${promptData.userPrompt}`;

      // Execute via task router
      const result = await this.taskRouter.executeTask(
        'question-improvement',
        fullPrompt,
        {
          forceProvider: options.forceProvider,
          temperature: options.temperature || 0.5, // Moderate temperature for creativity
          jsonMode: true,
          maxTokens: 2500
        }
      );

      // Parse JSON response
      const improvementResult = this.parseResponse(result.text);

      // Validate improved question format matches original type
      this.validateImprovedQuestion(improvementResult.improvedQuestion, question);

      // Build result with tracking info
      const trackedResult = {
        originalQuestion: question,
        improvedQuestion: improvementResult.improvedQuestion,
        improvements: improvementResult.improvements || [],
        changesSummary: improvementResult.changesSummary || '',
        expectedScore: improvementResult.expectedScore || 85,
        originalScore: validationFeedback.score,
        provider: result.provider,
        executionTime: result.executionTime
      };

      // Log success with structured format
      this.log('info', 'Question improved', {
        questionText: question.question.substring(0, 100),
        originalScore: validationFeedback.score,
        expectedScore: trackedResult.expectedScore,
        scoreIncrease: trackedResult.expectedScore - validationFeedback.score,
        improvementsCount: trackedResult.improvements.length,
        improvements: trackedResult.improvements,
        changesSummary: trackedResult.changesSummary,
        provider: result.provider,
        executionTime: result.executionTime
      });

      return trackedResult;

    } catch (error) {
      this.log('error', 'Failed to improve question', {
        error: error.message,
        errorType: error.name,
        questionText: question.question?.substring(0, 100),
        originalScore: validationFeedback?.score
      });
      throw error;
    }
  }

  /**
   * Improve multiple questions in parallel
   * 
   * @param {Array} questionsWithFeedback - Array of {question, validationFeedback} objects
   * @param {Object} options - Additional options
   * @param {number} [options.concurrency] - Max concurrent improvements (default: 5)
   * @param {string} [options.forceProvider] - Force a specific AI provider
   * @param {number} [options.temperature] - Sampling temperature (0-1)
   * @returns {Promise<Array>} Array of improvement results
   * @throws {Error} If batch improvement fails
   */
  async improveBatch(questionsWithFeedback, options = {}) {
    if (!Array.isArray(questionsWithFeedback)) {
      throw new Error('Questions with feedback must be an array');
    }

    if (questionsWithFeedback.length === 0) {
      return [];
    }

    const concurrency = options.concurrency || 5;

    console.log(`[QuestionImprovementAgent] Starting batch improvement`, {
      totalQuestions: questionsWithFeedback.length,
      concurrency
    });

    try {
      // Process questions in batches to limit concurrency
      const results = [];
      const improvedQuestionIds = [];
      
      for (let i = 0; i < questionsWithFeedback.length; i += concurrency) {
        const batch = questionsWithFeedback.slice(i, i + concurrency);
        
        console.log(`[QuestionImprovementAgent] Processing batch ${Math.floor(i / concurrency) + 1}`, {
          batchSize: batch.length,
          progress: `${i + batch.length}/${questionsWithFeedback.length}`
        });

        // Improve batch in parallel
        const batchResults = await Promise.all(
          batch.map(item => 
            this.improveQuestion(item.question, item.validationFeedback, options)
          )
        );

        results.push(...batchResults);
        
        // Track which questions were improved
        batchResults.forEach((result, idx) => {
          const originalItem = batch[idx];
          const questionId = originalItem.question.id || 
                           originalItem.question.question.substring(0, 50);
          improvedQuestionIds.push(questionId);
        });
      }

      // Log summary
      console.log(`[QuestionImprovementAgent] Batch improvement complete`, {
        totalQuestions: questionsWithFeedback.length,
        improvedCount: results.length,
        averageScoreIncrease: this.calculateAverageScoreIncrease(results),
        improvedQuestionIds
      });

      return results;

    } catch (error) {
      console.error(`[QuestionImprovementAgent] Batch improvement failed`, {
        error: error.message,
        errorType: error.name
      });
      throw error;
    }
  }

  /**
   * Format question for improvement prompt
   * 
   * @param {Object} question - Question to format
   * @returns {string} Formatted question text
   */
  formatQuestionForPrompt(question) {
    const parts = [];

    // Question text
    parts.push(`QUESTION: ${question.question}`);
    parts.push('');

    // Type-specific formatting
    switch (question.type) {
      case 'multipleChoice':
        parts.push('TYPE: Multiple Choice');
        parts.push('');
        parts.push('OPTIONS:');
        question.options.forEach((option, i) => {
          const label = String.fromCharCode(65 + i); // A, B, C, D
          const marker = i === question.correctAnswer ? ' (CORRECT)' : '';
          parts.push(`${label}) ${option}${marker}`);
        });
        break;

      case 'trueFalse':
        parts.push('TYPE: True/False');
        parts.push('');
        if (Array.isArray(question.options)) {
          parts.push('OPTIONS:');
          question.options.forEach((option, i) => {
            const marker = i === question.correctAnswer ? ' (CORRECT)' : '';
            parts.push(`${option}${marker}`);
          });
        } else {
          parts.push(`CORRECT ANSWER: ${question.correctAnswer ? 'True' : 'False'}`);
        }
        break;

      case 'fillInBlank':
        parts.push('TYPE: Fill in the Blank');
        parts.push('');
        parts.push(`CORRECT ANSWER: ${question.correctAnswer}`);
        parts.push(`CASE SENSITIVE: ${question.caseSensitive ? 'Yes' : 'No'}`);
        break;

      case 'matching':
        parts.push('TYPE: Matching');
        parts.push('');
        parts.push('LEFT COLUMN:');
        question.leftColumn.forEach((item, i) => {
          parts.push(`${i + 1}. ${item}`);
        });
        parts.push('');
        parts.push('RIGHT COLUMN:');
        question.rightColumn.forEach((item, i) => {
          parts.push(`${String.fromCharCode(65 + i)}. ${item}`);
        });
        parts.push('');
        parts.push('CORRECT PAIRS:');
        question.correctPairs.forEach(pair => {
          parts.push(`${pair.left + 1} → ${String.fromCharCode(65 + pair.right)}`);
        });
        break;

      default:
        parts.push(`TYPE: ${question.type || 'Unknown'}`);
    }

    // Add explanation if present
    if (question.explanation) {
      parts.push('');
      parts.push(`EXPLANATION: ${question.explanation}`);
    }

    // Add difficulty if present
    if (question.difficulty) {
      parts.push('');
      parts.push(`DIFFICULTY: ${question.difficulty}`);
    }

    return parts.join('\n');
  }

  /**
   * Format validation feedback for improvement prompt
   * 
   * @param {Object} validationFeedback - Validation result
   * @returns {string} Formatted feedback text
   */
  formatValidationFeedback(validationFeedback) {
    const parts = [];

    // Overall score and grade
    parts.push(`OVERALL SCORE: ${validationFeedback.score}/100`);
    parts.push(`GRADE: ${validationFeedback.grade || 'N/A'}`);
    parts.push('');

    // Clarity issues
    if (validationFeedback.clarity) {
      parts.push('CLARITY ISSUES:');
      if (validationFeedback.clarity.issues && validationFeedback.clarity.issues.length > 0) {
        validationFeedback.clarity.issues.forEach(issue => parts.push(`- ${issue}`));
      } else {
        parts.push('- None');
      }
      if (validationFeedback.clarity.suggestions && validationFeedback.clarity.suggestions.length > 0) {
        parts.push('Suggestions:');
        validationFeedback.clarity.suggestions.forEach(suggestion => parts.push(`  • ${suggestion}`));
      }
      parts.push('');
    }

    // Correctness issues
    if (validationFeedback.correctness) {
      parts.push('CORRECTNESS ISSUES:');
      if (validationFeedback.correctness.issues && validationFeedback.correctness.issues.length > 0) {
        validationFeedback.correctness.issues.forEach(issue => parts.push(`- ${issue}`));
      } else {
        parts.push('- None');
      }
      if (validationFeedback.correctness.suggestions && validationFeedback.correctness.suggestions.length > 0) {
        parts.push('Suggestions:');
        validationFeedback.correctness.suggestions.forEach(suggestion => parts.push(`  • ${suggestion}`));
      }
      parts.push('');
    }

    // Distractor quality issues
    if (validationFeedback.distractorQuality) {
      parts.push('DISTRACTOR QUALITY ISSUES:');
      if (validationFeedback.distractorQuality.issues && validationFeedback.distractorQuality.issues.length > 0) {
        validationFeedback.distractorQuality.issues.forEach(issue => parts.push(`- ${issue}`));
      } else {
        parts.push('- None');
      }
      if (validationFeedback.distractorQuality.suggestions && validationFeedback.distractorQuality.suggestions.length > 0) {
        parts.push('Suggestions:');
        validationFeedback.distractorQuality.suggestions.forEach(suggestion => parts.push(`  • ${suggestion}`));
      }
      parts.push('');
    }

    // Educational value issues
    if (validationFeedback.educationalValue) {
      parts.push('EDUCATIONAL VALUE ISSUES:');
      if (validationFeedback.educationalValue.issues && validationFeedback.educationalValue.issues.length > 0) {
        validationFeedback.educationalValue.issues.forEach(issue => parts.push(`- ${issue}`));
      } else {
        parts.push('- None');
      }
      if (validationFeedback.educationalValue.suggestions && validationFeedback.educationalValue.suggestions.length > 0) {
        parts.push('Suggestions:');
        validationFeedback.educationalValue.suggestions.forEach(suggestion => parts.push(`  • ${suggestion}`));
      }
      parts.push('');
    }

    // Overall recommendations
    if (validationFeedback.recommendations && validationFeedback.recommendations.length > 0) {
      parts.push('OVERALL RECOMMENDATIONS:');
      validationFeedback.recommendations.forEach(rec => parts.push(`- ${rec}`));
      parts.push('');
    }

    // Strengths to maintain
    if (validationFeedback.strengths && validationFeedback.strengths.length > 0) {
      parts.push('STRENGTHS TO MAINTAIN:');
      validationFeedback.strengths.forEach(strength => parts.push(`- ${strength}`));
    }

    return parts.join('\n');
  }

  /**
   * Parse AI response into structured format
   * 
   * @param {string|Object} response - AI response (JSON string or object)
   * @returns {Object} Parsed improvement result
   * @throws {Error} If response cannot be parsed
   */
  parseResponse(response) {
    try {
      let parsed;

      // If already an object, use it
      if (typeof response === 'object' && response !== null) {
        parsed = response;
      } else if (typeof response === 'string') {
        // Remove markdown code blocks if present
        let cleaned = response.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.substring(7);
        }
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith('```')) {
          cleaned = cleaned.substring(0, cleaned.length - 3);
        }
        cleaned = cleaned.trim();

        parsed = JSON.parse(cleaned);
      } else {
        throw new Error('Response must be a JSON string or object');
      }

      // Validate required fields
      if (!parsed.improvedQuestion || typeof parsed.improvedQuestion !== 'object') {
        throw new Error('Response must include an "improvedQuestion" object');
      }

      if (!Array.isArray(parsed.improvements)) {
        parsed.improvements = [];
      }

      if (typeof parsed.expectedScore !== 'number') {
        parsed.expectedScore = 85; // Default expected score
      }

      return parsed;

    } catch (error) {
      throw new Error(`Failed to parse improvement response: ${error.message}`);
    }
  }

  /**
   * Validate improved question format matches original type
   * 
   * @param {Object} improvedQuestion - Improved question
   * @param {Object} originalQuestion - Original question
   * @throws {Error} If format doesn't match
   */
  validateImprovedQuestion(improvedQuestion, originalQuestion) {
    // If improved question has a type field, ensure it matches the original
    // But if the type is a question category (factual, conceptual, application), ignore it
    const questionCategories = ['factual', 'conceptual', 'application', 'analysis'];
    
    if (improvedQuestion.type && 
        !questionCategories.includes(improvedQuestion.type) &&
        improvedQuestion.type !== originalQuestion.type) {
      throw new Error(
        `Improved question type (${improvedQuestion.type}) doesn't match original (${originalQuestion.type})`
      );
    }
    
    // If type is a category, remove it and use the original type
    if (improvedQuestion.type && questionCategories.includes(improvedQuestion.type)) {
      // Store the category separately and use original type
      improvedQuestion.questionCategory = improvedQuestion.type;
      improvedQuestion.type = originalQuestion.type;
    }
    
    // If no type specified, inherit from original
    if (!improvedQuestion.type) {
      improvedQuestion.type = originalQuestion.type;
    }

    // Type-specific validation
    switch (originalQuestion.type) {
      case 'multipleChoice':
        if (!Array.isArray(improvedQuestion.options) || improvedQuestion.options.length !== 4) {
          throw new Error('Multiple choice question must have exactly 4 options');
        }
        if (typeof improvedQuestion.correctAnswer !== 'number' || 
            improvedQuestion.correctAnswer < 0 || 
            improvedQuestion.correctAnswer > 3) {
          throw new Error('Multiple choice correctAnswer must be 0-3');
        }
        break;

      case 'trueFalse':
        if (typeof improvedQuestion.correctAnswer !== 'boolean' && 
            typeof improvedQuestion.correctAnswer !== 'number') {
          throw new Error('True/false question must have boolean or number correctAnswer');
        }
        break;

      case 'fillInBlank':
        if (typeof improvedQuestion.correctAnswer !== 'string') {
          throw new Error('Fill-in-blank question must have string correctAnswer');
        }
        if (typeof improvedQuestion.caseSensitive !== 'boolean') {
          throw new Error('Fill-in-blank question must have boolean caseSensitive');
        }
        break;

      case 'matching':
        if (!Array.isArray(improvedQuestion.leftColumn) || 
            !Array.isArray(improvedQuestion.rightColumn) ||
            !Array.isArray(improvedQuestion.correctPairs)) {
          throw new Error('Matching question must have leftColumn, rightColumn, and correctPairs arrays');
        }
        break;
    }

    // Ensure question text exists
    if (!improvedQuestion.question || typeof improvedQuestion.question !== 'string') {
      throw new Error('Improved question must have question text');
    }
  }

  /**
   * Count total issues in validation feedback
   * 
   * @param {Object} validationFeedback - Validation result
   * @returns {number} Total issue count
   */
  countIssues(validationFeedback) {
    let count = 0;

    const criteria = ['clarity', 'correctness', 'distractorQuality', 'educationalValue'];
    criteria.forEach(criterion => {
      if (validationFeedback[criterion] && 
          Array.isArray(validationFeedback[criterion].issues)) {
        count += validationFeedback[criterion].issues.length;
      }
    });

    if (Array.isArray(validationFeedback.overallIssues)) {
      count += validationFeedback.overallIssues.length;
    }

    return count;
  }

  /**
   * Calculate average score increase from improvement results
   * 
   * @param {Array} results - Improvement results
   * @returns {number} Average score increase
   */
  calculateAverageScoreIncrease(results) {
    if (results.length === 0) return 0;

    const totalIncrease = results.reduce((sum, result) => {
      const increase = result.expectedScore - result.originalScore;
      return sum + increase;
    }, 0);

    return Math.round((totalIncrease / results.length) * 100) / 100;
  }

  /**
   * Structured logging
   * 
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   * @param {Object} data - Additional structured data
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [QuestionImprovementAgent] ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage, JSON.stringify(data, null, 2));
        break;
      case 'warn':
        console.warn(logMessage, JSON.stringify(data, null, 2));
        break;
      default:
        console.log(logMessage, JSON.stringify(data, null, 2));
    }
  }
}

export default QuestionImprovementAgent;
