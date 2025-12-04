/**
 * Question Generation Agent
 * 
 * Generates high-quality quiz questions from extracted concepts.
 * Supports multiple question types with proper distribution and validation.
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
 * Question Generation Agent
 * Generates questions from extracted concepts with quality controls
 */
class QuestionGenerationAgent {
  constructor(taskRouter = null, promptManager = null) {
    this.taskRouter = taskRouter || aiTaskRouter;
    this.promptManager = promptManager || new PromptManager();
  }

  /**
   * Generate questions from extracted concepts
   * 
   * @param {Object} concepts - Extracted concepts from content extraction agent
   * @param {Object} distribution - Question type distribution (e.g., {multipleChoice: 8, trueFalse: 2})
   * @param {number} totalQuestions - Total number of questions to generate
   * @param {Object} options - Additional options
   * @param {string} [options.difficulty] - Overall difficulty level (easy, medium, hard, mixed)
   * @param {string} [options.forceProvider] - Force a specific AI provider
   * @param {number} [options.temperature] - Sampling temperature (0-1)
   * @param {string} [options.targetLanguage] - Target language for question generation (default: 'English')
   * @returns {Promise<Array>} Array of generated questions
   * @throws {ValidationError} If generated questions are invalid
   * @throws {Error} If generation fails
   */
  async generateQuestions(concepts, distribution, totalQuestions, options = {}) {
    // Validate inputs
    if (!concepts || typeof concepts !== 'object') {
      throw new Error('Concepts must be a valid object');
    }

    if (!distribution || typeof distribution !== 'object') {
      throw new Error('Distribution must be a valid object');
    }

    if (!totalQuestions || totalQuestions < 1) {
      throw new Error('Total questions must be at least 1');
    }

    // Validate distribution adds up to total
    const distributionTotal = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    if (distributionTotal !== totalQuestions) {
      throw new Error(
        `Distribution total (${distributionTotal}) must equal totalQuestions (${totalQuestions})`
      );
    }

    try {
      // Format concepts for prompt
      const formattedConcepts = this.formatConceptsForPrompt(concepts);

      // Determine difficulty and target language
      const difficulty = options.difficulty || 'mixed';
      const targetLanguage = options.targetLanguage || 'English';

      // Determine which prompt to use (subject-specific or general)
      const promptName = options.recommendedPrompt || 'question-generation';

      // Get formatted prompt from prompt manager
      const promptData = this.promptManager.getPrompt(promptName, {
        questionCount: totalQuestions,
        concepts: formattedConcepts,
        difficulty: difficulty,
        targetLanguage: targetLanguage
      });

      // Build full prompt with distribution requirements
      const distributionText = this.formatDistributionRequirements(distribution);
      const fullPrompt = `${promptData.systemPrompt}\n\n${promptData.userPrompt}\n\nQUESTION TYPE DISTRIBUTION:\n${distributionText}`;

      console.log(`[QuestionGenerationAgent] Generating ${totalQuestions} questions`, {
        distribution,
        difficulty,
        targetLanguage,
        promptName,
        conceptCount: concepts.keyConcepts?.length || 0
      });

      // Execute via task router
      // Note: Don't use jsonMode as it may constrain to single object instead of array
      const result = await this.taskRouter.executeTask(
        'question-generation',
        fullPrompt,
        {
          forceProvider: options.forceProvider,
          temperature: options.temperature || 0.7, // Higher temperature for more creative questions
          jsonMode: false, // Disabled to allow array responses
          maxTokens: 4000
        }
      );

      // Parse JSON response
      console.log('[QuestionGenerationAgent] Raw AI response length:', result.text.length);
      console.log('[QuestionGenerationAgent] Raw AI response preview:', result.text.substring(0, 500));
      
      const rawQuestions = this.parseResponse(result.text);
      console.log('[QuestionGenerationAgent] Parsed questions count:', Array.isArray(rawQuestions) ? rawQuestions.length : 'not an array');

      // Validate question formats
      const validQuestions = this.validateAndFilterQuestions(rawQuestions);
      console.log('[QuestionGenerationAgent] Valid questions count:', validQuestions.length);

      // Adjust distribution if needed
      const finalQuestions = this.adjustDistribution(validQuestions, distribution);

      // Log success
      console.log(`[QuestionGenerationAgent] Successfully generated questions`, {
        requested: totalQuestions,
        generated: finalQuestions.length,
        distribution: this.countByType(finalQuestions),
        provider: result.provider,
        executionTime: result.executionTime
      });

      return finalQuestions;

    } catch (error) {
      console.error(`[QuestionGenerationAgent] Failed to generate questions`, {
        error: error.message,
        errorType: error.name
      });
      throw error;
    }
  }

  /**
   * Format extracted concepts for the prompt
   * 
   * @param {Object} concepts - Extracted concepts
   * @returns {string} Formatted concepts text
   */
  formatConceptsForPrompt(concepts) {
    const parts = [];

    // Main topics
    if (concepts.mainTopics && concepts.mainTopics.length > 0) {
      parts.push('MAIN TOPICS:');
      concepts.mainTopics.forEach((topic, i) => {
        parts.push(`${i + 1}. ${topic}`);
      });
      parts.push('');
    }

    // Key concepts
    if (concepts.keyConcepts && concepts.keyConcepts.length > 0) {
      parts.push('KEY CONCEPTS:');
      concepts.keyConcepts.forEach((concept, i) => {
        parts.push(`${i + 1}. ${concept.name} (${concept.difficulty})`);
        parts.push(`   ${concept.description}`);
      });
      parts.push('');
    }

    // Critical facts
    if (concepts.criticalFacts && concepts.criticalFacts.length > 0) {
      parts.push('CRITICAL FACTS:');
      concepts.criticalFacts.forEach((fact, i) => {
        const factText = typeof fact === 'string' ? fact : fact.fact;
        parts.push(`${i + 1}. ${factText}`);
      });
      parts.push('');
    }

    // Learning objectives
    if (concepts.learningObjectives && concepts.learningObjectives.length > 0) {
      parts.push('LEARNING OBJECTIVES:');
      concepts.learningObjectives.forEach((objective, i) => {
        parts.push(`${i + 1}. ${objective}`);
      });
      parts.push('');
    }

    // Exceptions (if any)
    if (concepts.exceptions && concepts.exceptions.length > 0) {
      parts.push('EXCEPTIONS TO NOTE:');
      concepts.exceptions.forEach((exception, i) => {
        parts.push(`${i + 1}. Rule: ${exception.rule}`);
        parts.push(`   Exception: ${exception.exception}`);
        parts.push(`   Context: ${exception.context}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * Format distribution requirements for the prompt
   * 
   * @param {Object} distribution - Question type distribution
   * @returns {string} Formatted distribution text
   */
  formatDistributionRequirements(distribution) {
    const parts = [];
    
    if (distribution.multipleChoice) {
      parts.push(`- ${distribution.multipleChoice} Multiple Choice questions (4 options, 1 correct)`);
    }
    if (distribution.trueFalse) {
      parts.push(`- ${distribution.trueFalse} True/False questions`);
    }
    if (distribution.fillInBlank) {
      parts.push(`- ${distribution.fillInBlank} Fill-in-the-Blank questions`);
    }
    if (distribution.matching) {
      parts.push(`- ${distribution.matching} Matching questions`);
    }

    return parts.join('\n');
  }

  /**
   * Parse AI response into structured format
   * 
   * @param {string|Object|Array} response - AI response (JSON string, object, or array)
   * @returns {Array} Parsed questions array
   * @throws {Error} If response cannot be parsed
   */
  parseResponse(response) {
    try {
      // If already an array, return it
      if (Array.isArray(response)) {
        return response;
      }

      // If object with questions array, extract it
      if (typeof response === 'object' && response !== null) {
        if (Array.isArray(response.questions)) {
          return response.questions;
        }
        // If single question object, wrap in array
        if (response.question) {
          return [response];
        }
        return response;
      }

      // If string, try to parse as JSON
      if (typeof response === 'string') {
        // Remove markdown code blocks if present
        let cleaned = response.trim();
        
        // Handle text before code fence (e.g., "Here are the questions:```json")
        const jsonFenceIndex = cleaned.indexOf('```json');
        const fenceIndex = cleaned.indexOf('```');
        
        if (jsonFenceIndex !== -1) {
          // Found ```json, extract everything after it
          cleaned = cleaned.substring(jsonFenceIndex + 7);
        } else if (fenceIndex !== -1) {
          // Found ```, extract everything after it
          cleaned = cleaned.substring(fenceIndex + 3);
        }
        
        // Remove trailing code fence
        if (cleaned.endsWith('```')) {
          cleaned = cleaned.substring(0, cleaned.length - 3);
        }
        
        cleaned = cleaned.trim();

        const parsed = JSON.parse(cleaned);
        
        // Handle different response formats
        if (Array.isArray(parsed)) {
          return parsed;
        }
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return parsed.questions;
        }
        if (parsed.question) {
          return [parsed];
        }
        
        return parsed;
      }

      throw new Error('Response must be a JSON string, object, or array');

    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  /**
   * Validate and filter questions by format
   * 
   * @param {Array} questions - Raw questions from AI
   * @returns {Array} Valid questions only
   */
  validateAndFilterQuestions(questions) {
    if (!Array.isArray(questions)) {
      throw new Error('Questions must be an array');
    }

    const validQuestions = [];
    const invalidQuestions = [];

    questions.forEach((question, index) => {
      try {
        this.validateQuestionFormat(question);
        validQuestions.push(question);
      } catch (error) {
        console.warn(`[QuestionGenerationAgent] Invalid question at index ${index}:`, {
          error: error.message,
          question: question.question || 'unknown'
        });
        invalidQuestions.push({
          index,
          question,
          error: error.message
        });
      }
    });

    if (validQuestions.length === 0) {
      throw new ValidationError(
        'No valid questions generated',
        { invalidQuestions }
      );
    }

    if (invalidQuestions.length > 0) {
      console.warn(`[QuestionGenerationAgent] Filtered out ${invalidQuestions.length} invalid questions`);
    }

    return validQuestions;
  }

  /**
   * Validate question format based on type
   * 
   * @param {Object} question - Question to validate
   * @throws {ValidationError} If question format is invalid
   */
  validateQuestionFormat(question) {
    // All questions must have these fields
    if (!question.question || typeof question.question !== 'string') {
      throw new ValidationError('Question must have a "question" field with text');
    }

    // Infer question type from structure if not specified or if using educational type
    const inferredType = this.inferQuestionType(question);
    
    // Update question type to the inferred format type
    question.type = inferredType;

    // Type-specific validation
    switch (inferredType) {
      case 'multipleChoice':
        this.validateMultipleChoice(question);
        break;
      
      case 'trueFalse':
        this.validateTrueFalse(question);
        break;
      
      case 'fillInBlank':
        this.validateFillInBlank(question);
        break;
      
      case 'matching':
        this.validateMatching(question);
        break;
      
      default:
        throw new ValidationError(`Unknown question type: ${inferredType}`);
    }
  }

  /**
   * Infer question type from structure
   * AI might use educational types (factual, conceptual) instead of format types
   * 
   * @param {Object} question - Question to analyze
   * @returns {string} Inferred question type
   */
  inferQuestionType(question) {
    // Check for multiple choice (has options array with 4 items)
    if (Array.isArray(question.options) && question.options.length === 4) {
      return 'multipleChoice';
    }

    // Check for true/false (has options array with 2 items, or boolean correctAnswer)
    if (Array.isArray(question.options) && question.options.length === 2) {
      return 'trueFalse';
    }
    
    if (typeof question.correctAnswer === 'boolean') {
      return 'trueFalse';
    }

    // Check for matching (has leftColumn and rightColumn)
    if (Array.isArray(question.leftColumn) && Array.isArray(question.rightColumn)) {
      return 'matching';
    }

    // Check for fill-in-blank (has string correctAnswer and no options)
    if (typeof question.correctAnswer === 'string' && !question.options) {
      return 'fillInBlank';
    }

    // Default to multipleChoice if type is specified but not recognized
    if (question.type) {
      // If it has options, assume multiple choice
      if (Array.isArray(question.options)) {
        return 'multipleChoice';
      }
    }

    // Fallback
    return question.type || 'multipleChoice';
  }

  /**
   * Validate multiple choice question format
   * 
   * @param {Object} question - Question to validate
   * @throws {ValidationError} If format is invalid
   */
  validateMultipleChoice(question) {
    // Must have exactly 4 options
    if (!Array.isArray(question.options)) {
      throw new ValidationError('Multiple choice question must have an "options" array');
    }

    if (question.options.length !== 4) {
      throw new ValidationError(
        `Multiple choice question must have exactly 4 options (found ${question.options.length})`
      );
    }

    // All options must be non-empty strings
    question.options.forEach((option, i) => {
      if (!option || typeof option !== 'string' || option.trim().length === 0) {
        throw new ValidationError(`Option ${i} must be a non-empty string`);
      }
    });

    // correctAnswer must be 0, 1, 2, or 3
    if (typeof question.correctAnswer !== 'number') {
      throw new ValidationError('correctAnswer must be a number');
    }

    if (question.correctAnswer < 0 || question.correctAnswer > 3) {
      throw new ValidationError(
        `correctAnswer must be 0-3 (found ${question.correctAnswer})`
      );
    }
  }

  /**
   * Validate true/false question format
   * 
   * @param {Object} question - Question to validate
   * @throws {ValidationError} If format is invalid
   */
  validateTrueFalse(question) {
    // True/false can be represented in two ways:
    // 1. Boolean correctAnswer
    // 2. Options array with 2 items and numeric correctAnswer (0 or 1)
    
    if (Array.isArray(question.options)) {
      // Format: options array with 2 items
      if (question.options.length !== 2) {
        throw new ValidationError(
          `True/False question with options must have exactly 2 options (found ${question.options.length})`
        );
      }
      
      if (typeof question.correctAnswer !== 'number') {
        throw new ValidationError('True/False question with options must have numeric correctAnswer');
      }
      
      if (question.correctAnswer < 0 || question.correctAnswer > 1) {
        throw new ValidationError(
          `True/False question correctAnswer must be 0 or 1 (found ${question.correctAnswer})`
        );
      }
    } else {
      // Format: boolean correctAnswer
      if (typeof question.correctAnswer !== 'boolean') {
        throw new ValidationError(
          `True/False question correctAnswer must be a boolean (found ${typeof question.correctAnswer})`
        );
      }
    }
  }

  /**
   * Validate fill-in-blank question format
   * 
   * @param {Object} question - Question to validate
   * @throws {ValidationError} If format is invalid
   */
  validateFillInBlank(question) {
    // correctAnswer must be a string
    if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
      throw new ValidationError('Fill-in-blank question correctAnswer must be a non-empty string');
    }

    // caseSensitive must be a boolean (default to false if not provided)
    if (question.caseSensitive !== undefined && typeof question.caseSensitive !== 'boolean') {
      throw new ValidationError('caseSensitive must be a boolean');
    }

    // Set default if not provided
    if (question.caseSensitive === undefined) {
      question.caseSensitive = false;
    }
  }

  /**
   * Validate matching question format
   * 
   * @param {Object} question - Question to validate
   * @throws {ValidationError} If format is invalid
   */
  validateMatching(question) {
    // Must have leftColumn array
    if (!Array.isArray(question.leftColumn) || question.leftColumn.length === 0) {
      throw new ValidationError('Matching question must have a non-empty leftColumn array');
    }

    // Must have rightColumn array
    if (!Array.isArray(question.rightColumn) || question.rightColumn.length === 0) {
      throw new ValidationError('Matching question must have a non-empty rightColumn array');
    }

    // Columns should have same length
    if (question.leftColumn.length !== question.rightColumn.length) {
      throw new ValidationError(
        `Matching question columns must have same length (left: ${question.leftColumn.length}, right: ${question.rightColumn.length})`
      );
    }

    // Must have correctPairs array
    if (!Array.isArray(question.correctPairs) || question.correctPairs.length === 0) {
      throw new ValidationError('Matching question must have a non-empty correctPairs array');
    }

    // Validate each pair
    question.correctPairs.forEach((pair, i) => {
      if (!pair || typeof pair !== 'object') {
        throw new ValidationError(`correctPairs[${i}] must be an object`);
      }

      if (typeof pair.left !== 'number' || typeof pair.right !== 'number') {
        throw new ValidationError(`correctPairs[${i}] must have numeric left and right indices`);
      }

      if (pair.left < 0 || pair.left >= question.leftColumn.length) {
        throw new ValidationError(`correctPairs[${i}].left index out of bounds`);
      }

      if (pair.right < 0 || pair.right >= question.rightColumn.length) {
        throw new ValidationError(`correctPairs[${i}].right index out of bounds`);
      }
    });
  }

  /**
   * Adjust distribution to match requested counts
   * Handles cases where AI didn't generate enough of a specific type
   * 
   * @param {Array} questions - Valid questions
   * @param {Object} requestedDistribution - Requested distribution
   * @returns {Array} Questions adjusted to match distribution
   */
  adjustDistribution(questions, requestedDistribution) {
    // Count questions by type
    const actualCounts = this.countByType(questions);
    
    console.log(`[QuestionGenerationAgent] Distribution check`, {
      requested: requestedDistribution,
      actual: actualCounts
    });

    // Check if distribution matches
    const distributionMatches = Object.keys(requestedDistribution).every(
      type => actualCounts[type] === requestedDistribution[type]
    );

    if (distributionMatches) {
      return questions;
    }

    // Distribution doesn't match - need to adjust
    console.warn(`[QuestionGenerationAgent] Distribution mismatch, adjusting...`);

    const adjustedQuestions = [];
    const questionsByType = this.groupByType(questions);

    // Try to fulfill each type requirement
    for (const [type, requestedCount] of Object.entries(requestedDistribution)) {
      const availableQuestions = questionsByType[type] || [];
      const actualCount = availableQuestions.length;

      if (actualCount >= requestedCount) {
        // We have enough, take the requested amount
        adjustedQuestions.push(...availableQuestions.slice(0, requestedCount));
      } else if (actualCount > 0) {
        // We have some but not enough, take what we have
        adjustedQuestions.push(...availableQuestions);
        console.warn(
          `[QuestionGenerationAgent] Only ${actualCount}/${requestedCount} ${type} questions available`
        );
      } else {
        // We have none of this type
        console.warn(
          `[QuestionGenerationAgent] No ${type} questions generated, requested ${requestedCount}`
        );
      }
    }

    // If we don't have enough questions total, fill with any available questions
    const totalRequested = Object.values(requestedDistribution).reduce((sum, count) => sum + count, 0);
    if (adjustedQuestions.length < totalRequested) {
      const remainingQuestions = questions.filter(q => !adjustedQuestions.includes(q));
      const needed = totalRequested - adjustedQuestions.length;
      adjustedQuestions.push(...remainingQuestions.slice(0, needed));
      
      console.warn(
        `[QuestionGenerationAgent] Filled remaining ${needed} slots with available questions`
      );
    }

    return adjustedQuestions;
  }

  /**
   * Count questions by type
   * 
   * @param {Array} questions - Questions to count
   * @returns {Object} Counts by type
   */
  countByType(questions) {
    const counts = {
      multipleChoice: 0,
      trueFalse: 0,
      fillInBlank: 0,
      matching: 0
    };

    questions.forEach(question => {
      const type = question.type || 'multipleChoice';
      if (counts[type] !== undefined) {
        counts[type]++;
      }
    });

    return counts;
  }

  /**
   * Group questions by type
   * 
   * @param {Array} questions - Questions to group
   * @returns {Object} Questions grouped by type
   */
  groupByType(questions) {
    const groups = {
      multipleChoice: [],
      trueFalse: [],
      fillInBlank: [],
      matching: []
    };

    questions.forEach(question => {
      const type = question.type || 'multipleChoice';
      if (groups[type]) {
        groups[type].push(question);
      }
    });

    return groups;
  }
}

export default QuestionGenerationAgent;
export { ValidationError };
