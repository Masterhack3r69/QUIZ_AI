/**
 * Quality Validation Agent
 * 
 * Evaluates question quality across four criteria:
 * - Clarity: Is the question clear and unambiguous?
 * - Correctness: Is there one clearly correct answer?
 * - Distractor Quality: Are wrong answers plausible and educational?
 * - Educational Value: Does it test important understanding?
 */

import PromptManager from '../prompt-manager.js';
import aiTaskRouter from '../ai-task-router.js';

/**
 * Custom error for validation failures
 */
class ValidationError extends Error {
  constructor(message, validationDetails = {}) {
    super(message);
    this.name = 'ValidationError';
    this.validationDetails = validationDetails;
  }
}

/**
 * Quality Validation Agent
 * Evaluates question quality and identifies questions needing improvement
 */
class QualityValidationAgent {
  constructor(taskRouter = null, promptManager = null) {
    this.taskRouter = taskRouter || aiTaskRouter;
    this.promptManager = promptManager || new PromptManager();
  }

  /**
   * Validate a single question
   * 
   * @param {Object} question - Question to validate
   * @param {Object} options - Additional options
   * @param {string} [options.forceProvider] - Force a specific AI provider
   * @param {number} [options.temperature] - Sampling temperature (0-1)
   * @returns {Promise<Object>} Validation result with scores and feedback
   * @throws {ValidationError} If validation fails
   * @throws {Error} If validation process fails
   */
  async validateQuestion(question, options = {}) {
    // Validate input
    if (!question || typeof question !== 'object') {
      throw new Error('Question must be a valid object');
    }

    if (!question.question || typeof question.question !== 'string') {
      throw new Error('Question must have a "question" field with text');
    }

    try {
      // Format question for validation prompt
      const formattedQuestion = this.formatQuestionForPrompt(question);

      // Get formatted prompt from prompt manager
      const promptData = this.promptManager.getPrompt('quality-validation', {
        question: formattedQuestion
      });

      // Build full prompt
      const fullPrompt = `${promptData.systemPrompt}\n\n${promptData.userPrompt}`;

      console.log(`[QualityValidationAgent] Validating question`, {
        questionText: question.question.substring(0, 100),
        questionType: question.type
      });

      // Execute via task router
      const result = await this.taskRouter.executeTask(
        'quality-validation',
        fullPrompt,
        {
          forceProvider: options.forceProvider,
          temperature: options.temperature || 0.3, // Lower temperature for consistent evaluation
          jsonMode: true,
          maxTokens: 2000
        }
      );

      // Parse JSON response
      const validationResult = this.parseResponse(result.text);

      // Calculate overall score and grade
      const processedResult = this.processValidationResult(validationResult, question);

      // Log success with structured format
      this.log('info', 'Validation complete', {
        questionText: question.question.substring(0, 100),
        score: processedResult.score,
        grade: processedResult.grade,
        passesQuality: processedResult.passesQuality,
        requiresImprovement: processedResult.requiresImprovement,
        provider: result.provider,
        executionTime: result.executionTime
      });

      // Log validation failure details if question doesn't pass
      if (!processedResult.passesQuality) {
        this.log('warn', 'Question failed quality validation', {
          questionText: question.question.substring(0, 100),
          score: processedResult.score,
          issues: processedResult.overallIssues,
          clarityScore: processedResult.clarity.score,
          correctnessScore: processedResult.correctness.score,
          distractorScore: processedResult.distractorQuality.score,
          educationalScore: processedResult.educationalValue.score
        });
      }

      return processedResult;

    } catch (error) {
      this.log('error', 'Failed to validate question', {
        error: error.message,
        errorType: error.name,
        questionText: question.question?.substring(0, 100)
      });
      throw error;
    }
  }

  /**
   * Validate multiple questions in parallel
   * 
   * @param {Array} questions - Questions to validate
   * @param {Object} options - Additional options
   * @param {number} [options.concurrency] - Max concurrent validations (default: 5)
   * @param {string} [options.forceProvider] - Force a specific AI provider
   * @param {number} [options.temperature] - Sampling temperature (0-1)
   * @returns {Promise<Array>} Array of validation results
   * @throws {Error} If batch validation fails
   */
  async validateBatch(questions, options = {}) {
    if (!Array.isArray(questions)) {
      throw new Error('Questions must be an array');
    }

    if (questions.length === 0) {
      return [];
    }

    console.log(`[QualityValidationAgent] Starting batch validation`, {
      totalQuestions: questions.length
    });

    try {
      // Format questions for batch prompt
      const formattedQuestions = this.formatQuestionsForBatchPrompt(questions);

      // Get formatted prompt from prompt manager
      const promptData = this.promptManager.getPrompt('quality-validation', {
        questions: formattedQuestions
      });

      // Build full prompt
      const fullPrompt = `${promptData.systemPrompt}\n\n${promptData.userPrompt}`;

      // Execute via task router
      const result = await this.taskRouter.executeTask(
        'quality-validation',
        fullPrompt,
        {
          forceProvider: options.forceProvider,
          temperature: options.temperature || 0.3,
          jsonMode: true,
          maxTokens: 4000 // Increased token limit for batch response
        }
      );

      // Parse JSON response
      const validationResults = this.parseResponse(result.text);

      if (!Array.isArray(validationResults)) {
        throw new Error('Validation response must be an array');
      }

      // Process results and map back to original questions
      // We assume the AI returns results in the same order or with indices
      const processedResults = questions.map((question, index) => {
        // Try to find result by index if provided, otherwise assume order matches
        const validationResult = validationResults.find(r => r.questionIndex === index) || validationResults[index];
        
        if (!validationResult) {
          this.log('warn', `No validation result found for question index ${index}`, {
            questionText: question.question.substring(0, 50)
          });
          // Return a fallback result or throw
          return {
            score: 0,
            grade: 'poor',
            passesQuality: false,
            requiresImprovement: true,
            overallIssues: ['Validation failed or missing'],
            questionId: question.id || null,
            questionText: question.question
          };
        }

        return this.processValidationResult(validationResult, question);
      });

      // Aggregate results
      const aggregated = this.aggregateResults(processedResults, questions);

      console.log(`[QualityValidationAgent] Batch validation complete`, {
        totalQuestions: questions.length,
        averageScore: aggregated.averageScore,
        questionsNeedingImprovement: aggregated.questionsNeedingImprovement.length,
        passRate: aggregated.passRate
      });

      return processedResults;

    } catch (error) {
      console.error(`[QualityValidationAgent] Batch validation failed`, {
        error: error.message,
        errorType: error.name
      });
      throw error;
    }
  }

  /**
   * Format multiple questions for batch prompt
   * 
   * @param {Array} questions - Questions to format
   * @returns {string} Formatted questions text
   */
  formatQuestionsForBatchPrompt(questions) {
    return questions.map((question, index) => {
      const parts = [];
      parts.push(`--- QUESTION ${index + 1} (Index: ${index}) ---`);
      parts.push(this.formatQuestionForPrompt(question));
      return parts.join('\n');
    }).join('\n\n');
  }

  /**
   * Format question for validation prompt
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
   * Parse AI response into structured format
   * 
   * @param {string|Object} response - AI response (JSON string or object)
   * @returns {Object} Parsed validation result
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

      // Handle array response (batch validation)
      if (Array.isArray(parsed)) {
        return parsed;
      }

      // Handle single object response (legacy/single validation)
      // Validate required fields
      if (typeof parsed.score !== 'number') {
        throw new Error('Response must include a numeric "score" field');
      }

      return parsed;

    } catch (error) {
      throw new Error(`Failed to parse validation response: ${error.message}`);
    }
  }

  /**
   * Process validation result and calculate derived fields
   * 
   * @param {Object} validationResult - Raw validation result from AI
   * @param {Object} originalQuestion - Original question being validated
   * @returns {Object} Processed validation result
   */
  processValidationResult(validationResult, originalQuestion) {
    // Calculate overall score if not provided
    let overallScore = validationResult.score;
    
    if (!overallScore && validationResult.clarity && validationResult.correctness) {
      // Calculate from component scores
      const clarityScore = validationResult.clarity.score || 0;
      const correctnessScore = validationResult.correctness.score || 0;
      const distractorScore = validationResult.distractorQuality?.score || 0;
      const educationalScore = validationResult.educationalValue?.score || 0;
      
      overallScore = clarityScore + correctnessScore + distractorScore + educationalScore;
    }

    // Determine grade based on score
    let grade = validationResult.grade;
    if (!grade) {
      if (overallScore >= 85) {
        grade = 'excellent';
      } else if (overallScore >= 70) {
        grade = 'good';
      } else if (overallScore >= 50) {
        grade = 'fair';
      } else {
        grade = 'poor';
      }
    }

    // Determine if passes quality threshold (>= 70)
    const passesQuality = overallScore >= 70;
    
    // Determine if requires improvement (< 70)
    const requiresImprovement = overallScore < 70;

    // Build processed result
    const processed = {
      ...validationResult,
      score: overallScore,
      grade,
      passesQuality,
      requiresImprovement,
      questionId: originalQuestion.id || null,
      questionText: originalQuestion.question
    };

    // Ensure all criteria objects exist with default structure
    processed.clarity = this.ensureCriteriaStructure(validationResult.clarity);
    processed.correctness = this.ensureCriteriaStructure(validationResult.correctness);
    processed.distractorQuality = this.ensureCriteriaStructure(validationResult.distractorQuality);
    processed.educationalValue = this.ensureCriteriaStructure(validationResult.educationalValue);

    // Ensure arrays exist
    processed.overallIssues = validationResult.overallIssues || [];
    processed.strengths = validationResult.strengths || [];
    processed.recommendations = validationResult.recommendations || [];

    return processed;
  }

  /**
   * Ensure criteria object has proper structure
   * 
   * @param {Object} criteria - Criteria object from validation result
   * @returns {Object} Criteria with guaranteed structure
   */
  ensureCriteriaStructure(criteria) {
    if (!criteria || typeof criteria !== 'object') {
      return {
        score: 0,
        issues: [],
        suggestions: []
      };
    }

    return {
      score: criteria.score || 0,
      issues: Array.isArray(criteria.issues) ? criteria.issues : [],
      suggestions: Array.isArray(criteria.suggestions) ? criteria.suggestions : []
    };
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
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [QualityValidationAgent] ${message}`;

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

  /**
   * Aggregate batch validation results
   * 
   * @param {Array} results - Validation results
   * @param {Array} originalQuestions - Original questions
   * @returns {Object} Aggregated statistics
   */
  aggregateResults(results, originalQuestions) {
    const totalQuestions = results.length;
    
    // Calculate average score
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;

    // Count by grade
    const gradeDistribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0
    };

    results.forEach(result => {
      const grade = result.grade || 'poor';
      if (gradeDistribution[grade] !== undefined) {
        gradeDistribution[grade]++;
      }
    });

    // Identify questions needing improvement (score < 70)
    const questionsNeedingImprovement = results
      .map((result, index) => ({
        index,
        question: originalQuestions[index],
        validationResult: result
      }))
      .filter(item => item.validationResult.requiresImprovement);

    // Calculate pass rate
    const passCount = results.filter(r => r.passesQuality).length;
    const passRate = totalQuestions > 0 ? (passCount / totalQuestions) * 100 : 0;

    return {
      totalQuestions,
      averageScore: Math.round(averageScore * 100) / 100,
      gradeDistribution,
      questionsNeedingImprovement,
      passCount,
      passRate: Math.round(passRate * 100) / 100
    };
  }
}

export default QualityValidationAgent;
export { ValidationError };
