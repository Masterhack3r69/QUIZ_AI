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
      // Get subject context if provided
      const subjectContext = options.subjectContext || 'General educational content. Extract key concepts that can be tested.';
      
      // Get formatted prompt from prompt manager
      const promptData = await this.promptManager.getPrompt('content-extraction', {
        content: truncatedContent,
        subjectContext: subjectContext
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

      // Validate extracted concepts (pass content length for adaptive validation)
      this.validateExtractedConcepts(extractedConcepts, truncatedContent.length);

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
   * Perform comprehensive analysis (Subject Detection + Content Extraction)
   * 
   * @param {string} content - The educational content to analyze
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Combined analysis result
   */
  async comprehensiveAnalysis(content, options = {}) {
    // Validate input
    if (!content || typeof content !== 'string') {
      throw new Error('Content must be a non-empty string');
    }

    const truncatedContent = this.truncateContent(content);

    try {
      // Get formatted prompt
      const promptData = await this.promptManager.getPrompt('comprehensive-content-analysis', {
        content: truncatedContent
      });

      const fullPrompt = `${promptData.systemPrompt}\n\n${promptData.userPrompt}`;

      // Execute via task router
      const result = await this.taskRouter.executeTask(
        'comprehensive-content-analysis',
        fullPrompt,
        {
          forceProvider: options.forceProvider,
          temperature: options.temperature || 0.2,
          jsonMode: true,
          maxTokens: 3000
        }
      );

      // Parse response
      const analysis = this.parseResponse(result.text);

      // Validate extracted concepts part (pass content length for adaptive validation)
      if (analysis.extractedConcepts) {
        this.validateExtractedConcepts(analysis.extractedConcepts, truncatedContent.length);
      }

      console.log(`[ContentExtractionAgent] Comprehensive analysis complete`, {
        subject: analysis.subjectDetection?.primarySubject,
        concepts: analysis.extractedConcepts?.keyConcepts?.length,
        provider: result.provider
      });

      return {
        ...analysis,
        metadata: {
          contentLength: truncatedContent.length,
          provider: result.provider,
          executionTime: result.executionTime,
          analyzedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error(`[ContentExtractionAgent] Comprehensive analysis failed`, {
        error: error.message
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
   * Requirements scale based on content length:
   * - Short content (<200 chars): minimum 1 item per category
   * - Medium content (200-1000 chars): minimum 2 items per category  
   * - Long content (>1000 chars): full requirements (2-3+ items)
   * 
   * @param {Object} concepts - Extracted concepts to validate
   * @param {number} [contentLength] - Original content length for adaptive validation
   * @throws {ValidationError} If validation fails
   */
  validateExtractedConcepts(concepts, contentLength = null) {
    const errors = [];
    const warnings = [];

    // Validate structure
    if (!concepts || typeof concepts !== 'object') {
      throw new ValidationError('Extracted concepts must be an object');
    }

    // Determine minimum requirements based on content length
    // Short content can't reasonably produce many concepts
    let minTopics = 2;
    let minConcepts = 3;
    let minFacts = 3;
    let minObjectives = 2;

    if (contentLength !== null) {
      if (contentLength < 200) {
        // Very short content - be lenient
        minTopics = 1;
        minConcepts = 1;
        minFacts = 1;
        minObjectives = 1;
      } else if (contentLength < 500) {
        // Short content
        minTopics = 1;
        minConcepts = 2;
        minFacts = 2;
        minObjectives = 1;
      } else if (contentLength < 1000) {
        // Medium content
        minTopics = 2;
        minConcepts = 2;
        minFacts = 2;
        minObjectives = 2;
      }
      // Long content uses default full requirements
    }

    // Validate mainTopics
    if (!Array.isArray(concepts.mainTopics)) {
      errors.push('mainTopics must be an array');
    } else if (concepts.mainTopics.length < minTopics) {
      errors.push(`mainTopics must have at least ${minTopics} item(s) (found ${concepts.mainTopics.length})`);
    } else if (concepts.mainTopics.length > 5) {
      warnings.push(`mainTopics should have at most 5 items (found ${concepts.mainTopics.length})`);
    }

    // Validate keyConcepts
    if (!Array.isArray(concepts.keyConcepts)) {
      errors.push('keyConcepts must be an array');
    } else if (concepts.keyConcepts.length < minConcepts) {
      errors.push(`keyConcepts must have at least ${minConcepts} item(s) (found ${concepts.keyConcepts.length})`);
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

    // Validate criticalFacts
    if (!Array.isArray(concepts.criticalFacts)) {
      errors.push('criticalFacts must be an array');
    } else if (concepts.criticalFacts.length < minFacts) {
      errors.push(`criticalFacts must have at least ${minFacts} item(s) (found ${concepts.criticalFacts.length})`);
    } else if (concepts.criticalFacts.length > 10) {
      warnings.push(`criticalFacts should have at most 10 items (found ${concepts.criticalFacts.length})`);
    }

    // Validate learningObjectives
    if (!Array.isArray(concepts.learningObjectives)) {
      errors.push('learningObjectives must be an array');
    } else if (concepts.learningObjectives.length < minObjectives) {
      errors.push(`learningObjectives must have at least ${minObjectives} item(s) (found ${concepts.learningObjectives.length})`);
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
