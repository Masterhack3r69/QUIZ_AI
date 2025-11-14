import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigLoader {
  constructor() {
    this.aiTasksConfig = null;
    this.aiPromptsConfig = null;
    this.environment = process.env.NODE_ENV || 'development';
  }

  /**
   * Load AI task configuration based on environment
   * @returns {Object} AI tasks configuration
   */
  loadAITasksConfig() {
    if (this.aiTasksConfig) {
      return this.aiTasksConfig;
    }

    try {
      // Determine config file based on environment or AI_TASK_CONFIG env variable
      const configEnv = process.env.AI_TASK_CONFIG || this.environment;
      const configFileName = `ai-tasks.${configEnv}.json`;
      const configPath = path.join(__dirname, '../../config', configFileName);

      // Check if file exists
      if (!fs.existsSync(configPath)) {
        throw new Error(`AI tasks configuration file not found: ${configPath}`);
      }

      // Read and parse configuration
      const configData = fs.readFileSync(configPath, 'utf8');
      this.aiTasksConfig = JSON.parse(configData);

      // Validate configuration
      this.validateAITasksConfig(this.aiTasksConfig);

      console.log(`✓ Loaded AI tasks configuration: ${configFileName}`);
      return this.aiTasksConfig;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in AI tasks configuration: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Load AI prompts configuration
   * @returns {Object} AI prompts configuration
   */
  loadAIPromptsConfig() {
    if (this.aiPromptsConfig) {
      return this.aiPromptsConfig;
    }

    try {
      const configPath = path.join(__dirname, '../../config/ai-prompts.json');

      // Check if file exists
      if (!fs.existsSync(configPath)) {
        throw new Error(`AI prompts configuration file not found: ${configPath}`);
      }

      // Read and parse configuration
      const configData = fs.readFileSync(configPath, 'utf8');
      this.aiPromptsConfig = JSON.parse(configData);

      // Validate configuration
      this.validateAIPromptsConfig(this.aiPromptsConfig);

      console.log('✓ Loaded AI prompts configuration');
      return this.aiPromptsConfig;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in AI prompts configuration: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate AI tasks configuration structure
   * @param {Object} config - Configuration object to validate
   * @throws {Error} If configuration is invalid
   */
  validateAITasksConfig(config) {
    // Check required top-level fields
    if (!config.tasks || typeof config.tasks !== 'object') {
      throw new Error('AI tasks configuration must have a "tasks" object');
    }

    if (!config.providers || typeof config.providers !== 'object') {
      throw new Error('AI tasks configuration must have a "providers" object');
    }

    // Required task types
    const requiredTasks = [
      'content-extraction',
      'question-generation',
      'quality-validation',
      'question-improvement',
      'analytics'
    ];

    // Validate each required task exists
    for (const taskType of requiredTasks) {
      if (!config.tasks[taskType]) {
        throw new Error(`Missing required task configuration: ${taskType}`);
      }

      const task = config.tasks[taskType];

      // Validate task fields
      if (!task.primary || typeof task.primary !== 'string') {
        throw new Error(`Task "${taskType}" must have a "primary" provider string`);
      }

      if (!Array.isArray(task.fallback)) {
        throw new Error(`Task "${taskType}" must have a "fallback" array`);
      }

      if (typeof task.maxRetries !== 'number' || task.maxRetries < 0) {
        throw new Error(`Task "${taskType}" must have a valid "maxRetries" number`);
      }

      if (typeof task.timeout !== 'number' || task.timeout <= 0) {
        throw new Error(`Task "${taskType}" must have a valid "timeout" number`);
      }
    }

    // Validate providers
    const enabledProviders = Object.keys(config.providers).filter(
      key => config.providers[key].enabled !== false
    );

    if (enabledProviders.length === 0) {
      throw new Error('At least one provider must be enabled');
    }

    console.log(`✓ AI tasks configuration validated (${requiredTasks.length} tasks, ${enabledProviders.length} providers)`);
  }

  /**
   * Validate AI prompts configuration structure
   * @param {Object} config - Configuration object to validate
   * @throws {Error} If configuration is invalid
   */
  validateAIPromptsConfig(config) {
    // Check required top-level fields
    if (!config.agents || typeof config.agents !== 'object') {
      throw new Error('AI prompts configuration must have an "agents" object');
    }

    // Required agent types
    const requiredAgents = [
      'content-extraction',
      'question-generation',
      'quality-validation',
      'question-improvement',
      'analytics'
    ];

    // Validate each required agent exists
    for (const agentType of requiredAgents) {
      if (!config.agents[agentType]) {
        throw new Error(`Missing required agent configuration: ${agentType}`);
      }

      const agent = config.agents[agentType];

      // Validate agent fields
      if (!agent.name || typeof agent.name !== 'string') {
        throw new Error(`Agent "${agentType}" must have a "name" string`);
      }

      if (!agent.role || typeof agent.role !== 'string') {
        throw new Error(`Agent "${agentType}" must have a "role" string`);
      }

      if (!agent.systemPrompt || typeof agent.systemPrompt !== 'string') {
        throw new Error(`Agent "${agentType}" must have a "systemPrompt" string`);
      }

      if (!agent.template || typeof agent.template !== 'string') {
        throw new Error(`Agent "${agentType}" must have a "template" string`);
      }

      if (!Array.isArray(agent.requiredVariables)) {
        throw new Error(`Agent "${agentType}" must have a "requiredVariables" array`);
      }

      if (!agent.outputFormat || typeof agent.outputFormat !== 'string') {
        throw new Error(`Agent "${agentType}" must have an "outputFormat" string`);
      }

      if (!agent.outputSchema || typeof agent.outputSchema !== 'object') {
        throw new Error(`Agent "${agentType}" must have an "outputSchema" object`);
      }
    }

    console.log(`✓ AI prompts configuration validated (${requiredAgents.length} agents)`);
  }

  /**
   * Get configuration for a specific task
   * @param {string} taskType - Type of task (e.g., 'content-extraction')
   * @returns {Object} Task configuration
   */
  getTaskConfig(taskType) {
    const config = this.loadAITasksConfig();
    
    if (!config.tasks[taskType]) {
      throw new Error(`Unknown task type: ${taskType}`);
    }

    return config.tasks[taskType];
  }

  /**
   * Get configuration for a specific provider
   * @param {string} providerName - Name of provider (e.g., 'openrouter')
   * @returns {Object} Provider configuration
   */
  getProviderConfig(providerName) {
    const config = this.loadAITasksConfig();
    
    if (!config.providers[providerName]) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    return config.providers[providerName];
  }

  /**
   * Get prompt configuration for a specific agent
   * @param {string} agentType - Type of agent (e.g., 'content-extraction')
   * @returns {Object} Agent prompt configuration
   */
  getAgentPrompt(agentType) {
    const config = this.loadAIPromptsConfig();
    
    if (!config.agents[agentType]) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    return config.agents[agentType];
  }

  /**
   * Build a prompt from template with variables
   * @param {string} agentType - Type of agent
   * @param {Object} variables - Variables to inject into template
   * @returns {string} Formatted prompt
   */
  buildPrompt(agentType, variables = {}) {
    const agent = this.getAgentPrompt(agentType);
    
    // Check all required variables are provided
    for (const requiredVar of agent.requiredVariables) {
      if (!(requiredVar in variables)) {
        throw new Error(`Missing required variable "${requiredVar}" for agent "${agentType}"`);
      }
    }

    // Replace variables in template
    let prompt = agent.template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
    }

    return prompt;
  }

  /**
   * Reload all configurations (useful for hot-reloading)
   */
  reload() {
    this.aiTasksConfig = null;
    this.aiPromptsConfig = null;
    console.log('✓ Configuration cache cleared');
  }
}

// Export singleton instance
const configLoader = new ConfigLoader();
export default configLoader;
