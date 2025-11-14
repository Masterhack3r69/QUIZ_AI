/**
 * Content Extraction Agent
 * 
 * Analyzes educational content and extracts key learning concepts, topics, facts and learning objectives for quiz generation.
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
 * Content Extraction Agent
 * Extracts structured learning concepts from educational content
 */
class ContentExtractionAgent {
  constructor(taskRouter = null, promptManager = null) {
    this.taskRouter = taskRouter || aiTaskRouter;
    this.promptManager = promptManager || new PromptManager();
    this.maxContentLength = 15000; // Maximum characters to process
  }

  /**
   * Extract concepts from educational content
   * 
   * @param {string} content - The educational content to analyze
   * @param {Object} options - Additional options
   * @param {string} [options.forceProvider] - Force a specific AI provider
   * @param {number} [options.temperature] - Sampling temperature (0-1)
   * @returns {Promise<Object>} Extracted concepts with structured data
   * @throws {ValidationError} If extracted concepts are invalid
   * @throws {Error} If extraction fails
   */
  async extractConcepts(content, options = {}) {
    // Validate input
    if (!content || typeof content !== 'string') {
      throw new Error('Content must be a non-empty string');
    }

    if (content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    // Truncate content if too long
    const truncatedContent = this.truncateContent(content);
    
    if (truncatedContent.length < content.length) {
      console.log(`[ContentExtractionAgent] Content truncated from ${content.length} to ${truncatedContent.length} characters`);
    }

    try {
      // Get formatted prompt from prompt manager
      const promptData = this.promptManager.getPrompt('content-extraction', {
        content: truncatedContent
      });

      // Build full prompt
      const fullPrompt = `${promptData.systemPrompt}\n\n${promptData.userPrompt}`;

      // Execute via task router
      const result = await this.taskRouter.executeTask(
        'content-extraction',
        fullPrompt,
        {
          forceProvider: options.forceProvider,
          temperature: options.temperature || 0.3, // Lower temperature for more consistent extraction
          jsonMode: true,
          maxTokens: 2000
        }
      );

      // Parse JSON response
      const extractedConcepts = this.parseResponse(result.text);

      // Validate extracted concepts
      this.validateExtractedConcepts(extractedConcepts);

      // Log success
      console.log(`[ContentExtractionAgent] Successfully extracted concepts`, {
        mainTopics: extractedConcepts.mainTopics.length,
        keyConcepts: extractedConcepts.keyConcepts.length,
        criticalFacts: extractedConcepts.criticalFacts.length,
        learningObjectives: extractedConcepts.learningObjectives.length,
        provider: result.provider,
        executionTime: result.executionTime
      });

      return {
        ...extractedConcepts,
        metadata: {
          contentLength: truncatedContent.length,
          originalLength: content.length,
          truncated: truncatedContent.length < content.length,
          provider: result.provider,
          executionTime: result.executionTime,
          extractedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error(`[ContentExtractionAgent] Failed to extract concepts`, {
        error: error.message,
        errorType: error.name
      });
      throw error;
    }
  }

  /**
   * Truncate content to maximum length
   * Tries to truncate at sentence boundaries for better context
   * 
   * @param {string} content - Content to truncate
   * @returns {string} Truncated content
   */
  truncateContent(content) {
    if (content.length <= this.maxContentLength) {
      return content;
    }

    // Try to truncate at sentence boundary
    const truncated = content.substring(0, this.maxContentLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastNewline = truncated.lastIndexOf('\n');
    
    // Find the best truncation point
    const truncateAt = Math.max(lastPeriod, lastNewline);
    
    if (truncateAt > this.maxContentLength * 0.8) {
      // If we found a good boundary in the last 20%, use it
      return content.substring(0, truncateAt + 1);
    }

    // Otherwise, just truncate at max length
    return truncated;
  }

  /**
   * Parse AI response into structured format
   * 
   * @param {string|Object} response - AI response (JSON string or object)
   * @returns {Object} Parsed concepts
   * @throws {Error} If response cannot be parsed
   */
  parseResponse(response) {
    try {
      // If already an object, return it
      if (typeof response === 'object' && response !== null) {
        return response;
      }

      // If string, try to parse as JSON
      if (typeof response === 'string') {
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

        return JSON.parse(cleaned);
      }

      throw new Error('Response must be a JSON string or object');

    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  /**
   * Validate extracted concepts meet requirements
   * 
   * Requirements:
   * - mainTopics: 3-5 items
   * - keyConcepts: 5-10 items with required fields
   * - criticalFacts: 5-10 items
   * - learningObjectives: 3-5 items
   * 
   * @param {Object} concepts - Extracted concepts to validate
   * @throws {ValidationError} If validation fails
   */
  validateExtractedConcepts(concepts) {
    const errors = [];
    const warnings = [];

    // Validate structure
    if (!concepts || typeof concepts !== 'object') {
      throw new ValidationError('Extracted concepts must be an object');
    }

    // Validate mainTopics (3-5 items)
    if (!Array.isArray(concepts.mainTopics)) {
      errors.push('mainTopics must be an array');
    } else if (concepts.mainTopics.length < 3) {
      errors.push(`mainTopics must have at least 3 items (found ${concepts.mainTopics.length})`);
    } else if (concepts.mainTopics.length > 5) {
      warnings.push(`mainTopics should have at most 5 items (found ${concepts.mainTopics.length})`);
    }

    // Validate keyConcepts (5-10 items with required fields)
    if (!Array.isArray(concepts.keyConcepts)) {
      errors.push('keyConcepts must be an array');
    } else if (concepts.keyConcepts.length < 5) {
      errors.push(`keyConcepts must have at least 5 items (found ${concepts.keyConcepts.length})`);
    } else if (concepts.keyConcepts.length > 10) {
      warnings.push(`keyConcepts should have at most 10 items (found ${concepts.keyConcepts.length})`);
    } else {
      // Validate each concept has required fields
      concepts.keyConcepts.forEach((concept, index) => {
        if (!concept.name) {
          errors.push(`keyConcepts[${index}] missing required field: name`);
        }
        if (!concept.description) {
          errors.push(`keyConcepts[${index}] missing required field: description`);
        }
        if (!concept.difficulty) {
          errors.push(`keyConcepts[${index}] missing required field: difficulty`);
        } else if (!['easy', 'medium', 'hard'].includes(concept.difficulty)) {
          errors.push(`keyConcepts[${index}] difficulty must be easy, medium, or hard (found: ${concept.difficulty})`);
        }
        if (typeof concept.testable !== 'boolean') {
          errors.push(`keyConcepts[${index}] missing required field: testable (must be boolean)`);
        }
      });
    }

    // Validate criticalFacts (5-10 items)
    if (!Array.isArray(concepts.criticalFacts)) {
      errors.push('criticalFacts must be an array');
    } else if (concepts.criticalFacts.length < 5) {
      errors.push(`criticalFacts must have at least 5 items (found ${concepts.criticalFacts.length})`);
    } else if (concepts.criticalFacts.length > 10) {
      warnings.push(`criticalFacts should have at most 10 items (found ${concepts.criticalFacts.length})`);
    }

    // Validate learningObjectives (3-5 items)
    if (!Array.isArray(concepts.learningObjectives)) {
      errors.push('learningObjectives must be an array');
    } else if (concepts.learningObjectives.length < 3) {
      errors.push(`learningObjectives must have at least 3 items (found ${concepts.learningObjectives.length})`);
    } else if (concepts.learningObjectives.length > 5) {
      warnings.push(`learningObjectives should have at most 5 items (found ${concepts.learningObjectives.length})`);
    }

    // Log warnings
    if (warnings.length > 0) {
      console.warn(`[ContentExtractionAgent] Validation warnings:`, warnings);
    }

    // Throw error if validation failed
    if (errors.length > 0) {
      throw new ValidationError(
        `Extracted concepts validation failed: ${errors.join('; ')}`,
        {
          errors,
          warnings,
          concepts
        }
      );
    }
  }
}

export default ContentExtractionAgent;
export { ValidationError };
