/**
 * Test AI Providers
 * 
 * Simple script to test AI provider implementations
 * Run with: node src/examples/test-providers.js
 */

import dotenv from 'dotenv';
import { createProvider } from '../services/ai-providers/index.js';

// Load environment variables
dotenv.config();

/**
 * Test a single provider
 */
async function testProvider(providerName, config) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${providerName.toUpperCase()} Provider`);
  console.log('='.repeat(60));

  try {
    // Create provider instance
    const provider = createProvider(providerName, config);
    console.log(`✓ Provider instance created`);

    // Check availability
    const isAvailable = await provider.isAvailable();
    console.log(`✓ Availability check: ${isAvailable ? 'AVAILABLE' : 'NOT AVAILABLE'}`);

    if (!isAvailable) {
      console.log(`⚠ Skipping ${providerName} - not available`);
      return;
    }

    // Test simple completion
    console.log('\nTesting simple completion...');
    const prompt = 'Explain what artificial intelligence is in one sentence.';
    
    const response = await provider.generateCompletion(prompt, {
      temperature: 0.7,
      maxTokens: 100,
      timeout: 30000
    });

    console.log(`✓ Completion generated successfully`);
    console.log(`  Provider: ${response.provider}`);
    console.log(`  Model: ${response.model}`);
    console.log(`  Tokens used: ${response.tokensUsed || 'N/A'}`);
    console.log(`  Execution time: ${response.executionTime}ms`);
    console.log(`  Response: ${response.text.substring(0, 200)}${response.text.length > 200 ? '...' : ''}`);

    // Test JSON mode
    console.log('\nTesting JSON mode...');
    const jsonPrompt = 'Generate a JSON object with three fields: name (string), age (number), and hobbies (array of strings). Make up realistic data.';
    
    const jsonResponse = await provider.generateCompletion(jsonPrompt, {
      temperature: 0.5,
      maxTokens: 200,
      jsonMode: true
    });

    console.log(`✓ JSON completion generated`);
    console.log(`  Response: ${jsonResponse.text.substring(0, 200)}${jsonResponse.text.length > 200 ? '...' : ''}`);

    // Try to parse JSON
    try {
      const parsed = JSON.parse(jsonResponse.text);
      console.log(`✓ Valid JSON response`);
      console.log(`  Parsed keys: ${Object.keys(parsed).join(', ')}`);
    } catch (e) {
      console.log(`⚠ Response is not valid JSON`);
    }

    console.log(`\n✓ ${providerName.toUpperCase()} tests completed successfully`);

  } catch (error) {
    console.error(`✗ ${providerName.toUpperCase()} test failed:`, error.message);
    if (error.originalError) {
      console.error(`  Original error:`, error.originalError.message);
    }
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('AI Provider Test Suite');
  console.log('='.repeat(60));
  console.log('This script tests all AI provider implementations');
  console.log('Make sure you have the required API keys set in .env');
  console.log('='.repeat(60));

  // Test configurations
  const providers = [
    {
      name: 'openrouter',
      config: {
        enabled: true,
        baseURL: 'https://openrouter.ai/api/v1',
        model: 'meta-llama/llama-3.2-3b-instruct:free'
      }
    },
    {
      name: 'gemini',
      config: {
        enabled: true,
        model: 'gemini-2.0-flash-exp'
      }
    },
    {
      name: 'ollama',
      config: {
        enabled: true,
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: 'llama3.2:1b'
      }
    }
  ];

  // Test each provider
  for (const { name, config } of providers) {
    await testProvider(name, config);
  }

  console.log('\n' + '='.repeat(60));
  console.log('All tests completed!');
  console.log('='.repeat(60));
}

// Run tests
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
