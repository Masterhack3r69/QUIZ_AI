/**
 * Agentic Pipeline Orchestrator
 * 
 * Coordinates all AI agents to generate high-quality quizzes through a multi-step workflow:
 * 1. Content Extraction - Analyze content and extract key concepts
 * 2. Question Generation - Generate questions from concepts
 * 3. Quality Validation - Evaluate question quality
 * 4. Question Improvement - Enhance low-quality questions
 * 5. Final Merging - Combine improved questions into final set
 */

import ContentExtractionAgent from './agents/content-extraction-agent.js';
import QuestionGenerationAgent from './agents/question-generation-agent.js';
import QualityValidationAgent from './agents/quality-validation-agent.js';
import QuestionImprovementAgent from './agents/question-improvement-agent.js';

/**
 * Agentic Pipeline Orchestrator
 * Main entry point for multi-agent quiz generation
 */
class AgenticPipeline {
  constructor(agents = null, config = {}) {
    // Initialize agents (use provided or create new instances)
    if (agents) {
      this.contentExtractionAgent = agents.contentExtraction;
      this.questionGenerationAgent = agents.questionGeneration;
      this.qualityValidationAgent = agents.qualityValidation;
      this.questionImprovementAgent = agents.questionImprovement;
    } else {
      this.contentExtractionAgent = new ContentExtractionAgent();
      this.questionGenerationAgent = new QuestionGenerationAgent();
      this.qualityValidationAgent = new QualityValidationAgent();
      this.questionImprovementAgent = new QuestionImprovementAgent();
    }

    // Configuration
    this.config = {
      qualityThreshold: config.qualityThreshold || 70,
      enableQualityValidation: config.enableQualityValidation !== false,
      enableQuestionImprovement: config.enableQuestionImprovement !== false,
      maxImprovementAttempts: config.maxImprovementAttempts || 1,
      ...config
    };

    console.log('[AgenticPipeline] Initialized', {
      qualityThreshold: this.config.qualityThreshold,
      enableQualityValidation: this.config.enableQualityValidation,
      enableQuestionImprovement: this.config.enableQuestionImprovement
    });
  }

  /**
   * Generate quiz from content using multi-agent workflow
   * 
   * @param {string} content - Educational content to analyze
   * @param {Object} options - Quiz generation options
   * @param {number} options.totalQuestions - Total number of questions to generate
   * @param {Object} options.distribution - Question type distribution
   * @param {string} [options.difficulty] - Overall difficulty level
   * @param {string} [options.forceProvider] - Force specific AI provider
   * @returns {Promise<Object>} Generated quiz with questions and metadata
   * @throws {Error} If critical steps fail
   */
  async generateQuiz(content, options = {}) {
    const startTime = Date.now();
    
    console.log('[AgenticPipeline] Starting quiz generation', {
      contentLength: content?.length || 0,
      totalQuestions: options.totalQuestions,
      distribution: options.distribution,
      difficulty: options.difficulty
    });

    try {
      // Validate inputs
      this.validateInputs(content, options);

      // Step 1: Extract concepts from content
      console.log('[AgenticPipeline] Step 1: Extracting concepts...');
      const concepts = await this.extractConcepts(content, options);

      // Step 2: Generate questions from concepts
      console.log('[AgenticPipeline] Step 2: Generating questions...');
      const rawQuestions = await this.generateQuestions(concepts, options);

      // Step 3: Validate question quality (if enabled)
      let validationResults = null;
      if (this.config.enableQualityValidation) {
        console.log('[AgenticPipeline] Step 3: Validating question quality...');
        validationResults = await this.validateQuestions(rawQuestions, options);
      }

      // Step 4: Identify and improve low-quality questions (if enabled)
      let improvedQuestions = [];
      if (this.config.enableQuestionImprovement && validationResults) {
        console.log('[AgenticPipeline] Step 4: Improving low-quality questions...');
        const lowQualityQuestions = this.identifyLowQualityQuestions(
          rawQuestions,
          validationResults
        );
        
        if (lowQualityQuestions.length > 0) {
          improvedQuestions = await this.improveQuestions(lowQualityQuestions, options);
        }
      }

      // Step 5: Merge improved questions into final set
      console.log('[AgenticPipeline] Step 5: Merging final questions...');
      const finalQuestions = this.mergeFinalQuestions(
        rawQuestions,
        improvedQuestions,
        validationResults
      );

      const executionTime = Date.now() - startTime;

      // Build result
      const result = {
        questions: finalQuestions,
        metadata: {
          totalQuestions: finalQuestions.length,
          distribution: this.countQuestionsByType(finalQuestions),
          concepts: concepts,
          qualityMetrics: validationResults ? this.calculateQualityMetrics(validationResults) : null,
          improvementMetrics: improvedQuestions.length > 0 ? {
            questionsImproved: improvedQuestions.length,
            averageScoreIncrease: this.calculateAverageScoreIncrease(improvedQuestions)
          } : null,
          executionTime,
          generatedAt: new Date().toISOString()
        }
      };

      console.log('[AgenticPipeline] Quiz generation complete', {
        totalQuestions: finalQuestions.length,
        executionTime,
        questionsImproved: improvedQuestions.length,
        averageQuality: result.metadata.qualityMetrics?.averageScore || 'N/A'
      });

      return result;

    } catch (error) {
      console.error('[AgenticPipeline] Quiz generation failed', {
        error: error.message,
        errorType: error.name,
        executionTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Validate inputs for quiz generation
   * 
   * @param {string} content - Content to validate
   * @param {Object} options - Options to validate
   * @throws {Error} If inputs are invalid
   */
  validateInputs(content, options) {
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Content must be a non-empty string');
    }

    if (!options.totalQuestions || options.totalQuestions < 1) {
      throw new Error('totalQuestions must be at least 1');
    }

    if (!options.distribution || typeof options.distribution !== 'object') {
      throw new Error('distribution must be a valid object');
    }

    const distributionTotal = Object.values(options.distribution).reduce(
      (sum, count) => sum + count,
      0
    );

    if (distributionTotal !== options.totalQuestions) {
      throw new Error(
        `Distribution total (${distributionTotal}) must equal totalQuestions (${options.totalQuestions})`
      );
    }
  }

  /**
   * Step 1: Extract concepts from content
   * 
   * @param {string} content - Educational content
   * @param {Object} options - Options
   * @returns {Promise<Object>} Extracted concepts
   * @throws {Error} If extraction fails
   */
  async extractConcepts(content, options) {
    try {
      const concepts = await this.contentExtractionAgent.extractConcepts(content, {
        forceProvider: options.forceProvider
      });

      console.log('[AgenticPipeline] Concepts extracted successfully', {
        mainTopics: concepts.mainTopics?.length || 0,
        keyConcepts: concepts.keyConcepts?.length || 0,
        criticalFacts: concepts.criticalFacts?.length || 0
      });

      return concepts;

    } catch (error) {
      console.error('[AgenticPipeline] Content extraction failed', {
        error: error.message
      });
      throw new Error(`Failed to extract concepts: ${error.message}`);
    }
  }

  /**
   * Step 2: Generate questions from concepts
   * 
   * @param {Object} concepts - Extracted concepts
   * @param {Object} options - Options
   * @returns {Promise<Array>} Generated questions
   * @throws {Error} If generation fails
   */
  async generateQuestions(concepts, options) {
    try {
      const questions = await this.questionGenerationAgent.generateQuestions(
        concepts,
        options.distribution,
        options.totalQuestions,
        {
          difficulty: options.difficulty,
          forceProvider: options.forceProvider
        }
      );

      console.log('[AgenticPipeline] Questions generated successfully', {
        count: questions.length,
        distribution: this.countQuestionsByType(questions)
      });

      return questions;

    } catch (error) {
      console.error('[AgenticPipeline] Question generation failed', {
        error: error.message
      });
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  /**
   * Step 3: Validate question quality
   * 
   * @param {Array} questions - Questions to validate
   * @param {Object} options - Options
   * @returns {Promise<Array>} Validation results
   * @throws {Error} If validation fails (non-critical, will log and continue)
   */
  async validateQuestions(questions, options) {
    try {
      const validationResults = await this.qualityValidationAgent.validateBatch(questions, {
        forceProvider: options.forceProvider
      });

      const lowQualityCount = validationResults.filter(
        r => r.score < this.config.qualityThreshold
      ).length;

      console.log('[AgenticPipeline] Quality validation complete', {
        totalQuestions: questions.length,
        lowQualityCount,
        averageScore: this.calculateAverageScore(validationResults)
      });

      return validationResults;

    } catch (error) {
      console.error('[AgenticPipeline] Quality validation failed (non-critical)', {
        error: error.message
      });
      // Return null to indicate validation failed but continue with original questions
      return null;
    }
  }

  /**
   * Step 4: Identify low-quality questions that need improvement
   * 
   * @param {Array} questions - Original questions
   * @param {Array} validationResults - Validation results
   * @returns {Array} Questions with feedback that need improvement
   */
  identifyLowQualityQuestions(questions, validationResults) {
    if (!validationResults || validationResults.length !== questions.length) {
      console.warn('[AgenticPipeline] Cannot identify low-quality questions: validation results mismatch');
      return [];
    }

    const lowQualityQuestions = [];

    questions.forEach((question, index) => {
      const validation = validationResults[index];
      
      if (validation && validation.score < this.config.qualityThreshold) {
        lowQualityQuestions.push({
          question,
          validationFeedback: validation,
          index
        });
      }
    });

    console.log('[AgenticPipeline] Identified low-quality questions', {
      count: lowQualityQuestions.length,
      threshold: this.config.qualityThreshold
    });

    return lowQualityQuestions;
  }

  /**
   * Step 5: Improve low-quality questions
   * 
   * @param {Array} lowQualityQuestions - Questions with feedback
   * @param {Object} options - Options
   * @returns {Promise<Array>} Improvement results
   */
  async improveQuestions(lowQualityQuestions, options) {
    if (lowQualityQuestions.length === 0) {
      return [];
    }

    try {
      const improvementResults = await this.questionImprovementAgent.improveBatch(
        lowQualityQuestions,
        {
          forceProvider: options.forceProvider
        }
      );

      console.log('[AgenticPipeline] Questions improved successfully', {
        count: improvementResults.length,
        averageScoreIncrease: this.calculateAverageScoreIncrease(improvementResults)
      });

      return improvementResults;

    } catch (error) {
      console.error('[AgenticPipeline] Question improvement failed (non-critical)', {
        error: error.message
      });
      // Return empty array to use original questions as fallback
      return [];
    }
  }

  /**
   * Merge improved questions back into final set
   * Replaces low-quality questions with improved versions
   * 
   * @param {Array} originalQuestions - Original generated questions
   * @param {Array} improvementResults - Improvement results with improved questions
   * @param {Array} validationResults - Validation results (optional)
   * @returns {Array} Final merged question set
   */
  mergeFinalQuestions(originalQuestions, improvementResults, validationResults) {
    // If no improvements were made, return original questions
    if (!improvementResults || improvementResults.length === 0) {
      console.log('[AgenticPipeline] No improvements to merge, using original questions');
      return originalQuestions;
    }

    // Create a map of improved questions by their original index
    const improvementMap = new Map();
    
    improvementResults.forEach(result => {
      // Find the index of the original question
      const originalIndex = originalQuestions.findIndex(
        q => q.question === result.originalQuestion.question
      );
      
      if (originalIndex !== -1) {
        improvementMap.set(originalIndex, result.improvedQuestion);
      }
    });

    // Build final question set
    const finalQuestions = originalQuestions.map((originalQuestion, index) => {
      // Check if this question was improved
      if (improvementMap.has(index)) {
        const improvedQuestion = improvementMap.get(index);
        
        console.log('[AgenticPipeline] Replacing question at index', {
          index,
          originalText: originalQuestion.question.substring(0, 50),
          improvedText: improvedQuestion.question.substring(0, 50)
        });
        
        return improvedQuestion;
      }
      
      // Use original question
      return originalQuestion;
    });

    // Validate final questions meet minimum threshold (if validation results available)
    if (validationResults && this.config.enableQualityValidation) {
      const belowThreshold = [];
      
      finalQuestions.forEach((question, index) => {
        const validation = validationResults[index];
        
        // If this question was improved, assume it meets threshold
        if (improvementMap.has(index)) {
          return;
        }
        
        // Check if original question is below threshold
        if (validation && validation.score < this.config.qualityThreshold) {
          belowThreshold.push({
            index,
            score: validation.score,
            question: question.question.substring(0, 50)
          });
        }
      });

      if (belowThreshold.length > 0) {
        console.warn('[AgenticPipeline] Some questions still below quality threshold', {
          count: belowThreshold.length,
          threshold: this.config.qualityThreshold,
          questions: belowThreshold
        });
      }
    }

    // Ensure requested distribution is maintained
    const finalDistribution = this.countQuestionsByType(finalQuestions);
    
    console.log('[AgenticPipeline] Final questions merged', {
      totalQuestions: finalQuestions.length,
      questionsReplaced: improvementMap.size,
      distribution: finalDistribution
    });

    return finalQuestions;
  }

  /**
   * Helper: Count questions by type
   * 
   * @param {Array} questions - Questions to count
   * @returns {Object} Counts by type
   */
  countQuestionsByType(questions) {
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
   * Helper: Calculate average score from validation results
   * 
   * @param {Array} validationResults - Validation results
   * @returns {number} Average score
   */
  calculateAverageScore(validationResults) {
    if (!validationResults || validationResults.length === 0) {
      return 0;
    }

    const totalScore = validationResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round((totalScore / validationResults.length) * 100) / 100;
  }

  /**
   * Helper: Calculate average score increase from improvement results
   * 
   * @param {Array} improvementResults - Improvement results
   * @returns {number} Average score increase
   */
  calculateAverageScoreIncrease(improvementResults) {
    if (!improvementResults || improvementResults.length === 0) {
      return 0;
    }

    const totalIncrease = improvementResults.reduce((sum, result) => {
      const increase = result.expectedScore - result.originalScore;
      return sum + increase;
    }, 0);

    return Math.round((totalIncrease / improvementResults.length) * 100) / 100;
  }

  /**
   * Helper: Calculate quality metrics from validation results
   * 
   * @param {Array} validationResults - Validation results
   * @returns {Object} Quality metrics
   */
  calculateQualityMetrics(validationResults) {
    if (!validationResults || validationResults.length === 0) {
      return null;
    }

    const totalQuestions = validationResults.length;
    const averageScore = this.calculateAverageScore(validationResults);

    // Count by grade
    const gradeDistribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0
    };

    validationResults.forEach(result => {
      const grade = result.grade || 'poor';
      if (gradeDistribution[grade] !== undefined) {
        gradeDistribution[grade]++;
      }
    });

    // Calculate pass rate
    const passCount = validationResults.filter(r => r.passesQuality).length;
    const passRate = (passCount / totalQuestions) * 100;

    return {
      totalQuestions,
      averageScore,
      gradeDistribution,
      passCount,
      passRate: Math.round(passRate * 100) / 100
    };
  }
}

export default AgenticPipeline;
