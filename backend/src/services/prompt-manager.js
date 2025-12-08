import { getPromptLoader } from './gcs-prompt-loader.js';

/**
 * PromptManager - Manages AI agent prompts with variable substitution and validation
 * 
 * Now uses GCS Prompt Loader for cloud-based prompt management.
 * Falls back to local file if GCS is unavailable.
 * 
 * Responsibilities:
 * - Load prompts from GCS or local configuration file
 * - Cache loaded prompts for performance
 * - Format prompts with variable substitution
 * - Validate required variables are provided
 */
class PromptManager {
  constructor() {
    this.prompts = null;
    this.cache = new Map();
    this._loaderPromise = null;
  }

  /**
   * Load prompts from GCS or local file
   * @returns {Promise<Object>} Loaded prompts configuration
   * @throws {Error} If config cannot be loaded or parsed
   */
  async loadPromptsAsync() {
    try {
      const loader = getPromptLoader();
      const config = await loader.loadPrompts();

      if (!config.agents || typeof config.agents !== 'object') {
        throw new Error('Invalid prompts configuration: missing "agents" object');
      }

      this.prompts = config.agents;
      return this.prompts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Synchronous load - for backward compatibility
   * Uses cached prompts or triggers async load
   * @returns {Object} Loaded prompts configuration
   */
  loadPrompts() {
    if (this.prompts) {
      return this.prompts;
    }
    
    // Trigger async load and throw helpful error
    this.loadPromptsAsync().catch(err => {
      console.error('[PromptManager] Async load failed:', err.message);
    });
    
    throw new Error('Prompts not loaded yet. Use await promptManager.loadPromptsAsync() first, or call getPrompt() which handles async loading.');
  }

  /**
   * Get a prompt for a specific agent with variable substitution (async)
   * @param {string} agentName - Name of the agent (e.g., 'content-extraction')
   * @param {Object} variables - Variables to substitute in the template
   * @returns {Promise<Object>} Formatted prompt with system role and user message
   * @throws {Error} If agent not found or variables are invalid
   */
  async getPrompt(agentName, variables = {}) {
    // Load prompts if not already loaded
    if (!this.prompts) {
      await this.loadPromptsAsync();
    }

    // Check if agent exists
    if (!this.prompts[agentName]) {
      throw new Error(`Agent "${agentName}" not found in prompts configuration. Available agents: ${Object.keys(this.prompts).join(', ')}`);
    }

    const agentConfig = this.prompts[agentName];

    // Validate required variables
    this.validateVariables(agentConfig, variables);

    // Format the prompt template with variables
    const formattedTemplate = this.formatPrompt(agentConfig.template, variables);

    // Return formatted prompt with system role
    return {
      systemPrompt: agentConfig.systemPrompt,
      userPrompt: formattedTemplate,
      outputFormat: agentConfig.outputFormat,
      outputSchema: agentConfig.outputSchema,
      agentName: agentConfig.name,
      role: agentConfig.role
    };
  }

  /**
   * Validate that all required variables are provided
   * @param {Object} agentConfig - Agent configuration from prompts file
   * @param {Object} variables - Variables provided by caller
   * @throws {Error} If required variables are missing or invalid
   */
  validateVariables(agentConfig, variables) {
    const requiredVars = agentConfig.requiredVariables || [];
    const missingVars = [];

    for (const varName of requiredVars) {
      if (!(varName in variables)) {
        missingVars.push(varName);
      } else if (variables[varName] === null || variables[varName] === undefined) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required variables for agent "${agentConfig.name}": ${missingVars.join(', ')}. ` +
        `Required: ${requiredVars.join(', ')}`
      );
    }

    // Validate variable types
    for (const [varName, varValue] of Object.entries(variables)) {
      if (varValue === null || varValue === undefined) {
        continue;
      }

      // Check for invalid types that can't be stringified properly
      if (typeof varValue === 'function') {
        throw new Error(`Invalid variable type for "${varName}": functions are not allowed`);
      }

      if (typeof varValue === 'symbol') {
        throw new Error(`Invalid variable type for "${varName}": symbols are not allowed`);
      }
    }
  }

  /**
   * Format a prompt template by replacing {variable} placeholders
   * @param {string} template - Prompt template with {variable} placeholders
   * @param {Object} variables - Variables to substitute
   * @returns {string} Formatted prompt
   */
  formatPrompt(template, variables) {
    let formatted = template;

    // Replace each variable placeholder
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      const formattedValue = this.formatVariable(value);
      
      // Replace all occurrences of this placeholder
      formatted = formatted.split(placeholder).join(formattedValue);
    }

    return formatted;
  }

  /**
   * Format a variable value for insertion into prompt
   * Handles special cases like objects, arrays, and nested structures
   * @param {*} value - Variable value to format
   * @returns {string} Formatted string representation
   */
  formatVariable(value) {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return '';
    }

    // Handle strings - return as-is
    if (typeof value === 'string') {
      return value;
    }

    // Handle numbers and booleans - convert to string
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    // Handle arrays - format as JSON or list depending on content
    if (Array.isArray(value)) {
      // If array of primitives, format as simple list
      if (value.every(item => typeof item === 'string' || typeof item === 'number')) {
        return value.join(', ');
      }
      // Otherwise, format as JSON
      return JSON.stringify(value, null, 2);
    }

    // Handle objects - format as JSON
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    // Fallback - convert to string
    return String(value);
  }

  /**
   * Clear the prompt cache
   * Useful when prompts configuration is updated
   */
  clearCache() {
    this.cache.clear();
    this.prompts = null;
  }

  /**
   * Get list of available agent names
   * @returns {string[]} Array of agent names
   */
  getAvailableAgents() {
    if (!this.prompts) {
      this.loadPrompts();
    }
    return Object.keys(this.prompts);
  }

  /**
   * Get agent configuration without formatting
   * @param {string} agentName - Name of the agent
   * @returns {Object} Agent configuration
   */
  getAgentConfig(agentName) {
    if (!this.prompts) {
      this.loadPrompts();
    }

    if (!this.prompts[agentName]) {
      throw new Error(`Agent "${agentName}" not found in prompts configuration`);
    }

    return { ...this.prompts[agentName] };
  }
}

export default PromptManager;
