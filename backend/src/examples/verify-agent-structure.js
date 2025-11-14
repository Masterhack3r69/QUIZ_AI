/**
 * Verify Content Extraction Agent structure
 * Tests that the agent is properly structured without making API calls
 */

import ContentExtractionAgent from '../services/agents/content-extraction-agent.js';

console.log('='.repeat(80));
console.log('Verifying Content Extraction Agent Structure');
console.log('='.repeat(80));
console.log();

try {
  // Test 1: Agent can be instantiated
  console.log('✓ Test 1: Creating agent instance...');
  const agent = new ContentExtractionAgent();
  console.log('  ✅ Agent created successfully');
  console.log();

  // Test 2: Agent has required methods
  console.log('✓ Test 2: Checking required methods...');
  const requiredMethods = [
    'extractConcepts',
    'truncateContent',
    'parseResponse',
    'validateExtractedConcepts'
  ];
  
  for (const method of requiredMethods) {
    if (typeof agent[method] === 'function') {
      console.log(`  ✅ ${method}() exists`);
    } else {
      throw new Error(`Missing method: ${method}`);
    }
  }
  console.log();

  // Test 3: Agent has required properties
  console.log('✓ Test 3: Checking required properties...');
  if (agent.taskRouter) {
    console.log('  ✅ taskRouter initialized');
  } else {
    throw new Error('taskRouter not initialized');
  }
  
  if (agent.promptManager) {
    console.log('  ✅ promptManager initialized');
  } else {
    throw new Error('promptManager not initialized');
  }
  
  if (agent.maxContentLength === 15000) {
    console.log('  ✅ maxContentLength set to 15000');
  } else {
    throw new Error(`maxContentLength should be 15000, got ${agent.maxContentLength}`);
  }
  console.log();

  // Test 4: Content truncation works
  console.log('✓ Test 4: Testing content truncation...');
  const longContent = 'a'.repeat(20000);
  const truncated = agent.truncateContent(longContent);
  if (truncated.length <= 15000) {
    console.log(`  ✅ Content truncated from ${longContent.length} to ${truncated.length} chars`);
  } else {
    throw new Error('Content truncation failed');
  }
  console.log();

  // Test 5: JSON parsing works
  console.log('✓ Test 5: Testing JSON parsing...');
  const testJson = { mainTopics: ['test'], keyConcepts: [], criticalFacts: [], learningObjectives: [] };
  const parsed1 = agent.parseResponse(testJson);
  console.log('  ✅ Parses object input');
  
  const parsed2 = agent.parseResponse(JSON.stringify(testJson));
  console.log('  ✅ Parses JSON string input');
  
  const parsed3 = agent.parseResponse('```json\n' + JSON.stringify(testJson) + '\n```');
  console.log('  ✅ Parses markdown-wrapped JSON');
  console.log();

  // Test 6: Validation catches errors
  console.log('✓ Test 6: Testing validation...');
  
  // Valid concepts
  const validConcepts = {
    mainTopics: ['Topic 1', 'Topic 2', 'Topic 3'],
    keyConcepts: [
      { name: 'Concept 1', description: 'Desc 1', difficulty: 'easy', testable: true },
      { name: 'Concept 2', description: 'Desc 2', difficulty: 'medium', testable: true },
      { name: 'Concept 3', description: 'Desc 3', difficulty: 'hard', testable: false },
      { name: 'Concept 4', description: 'Desc 4', difficulty: 'easy', testable: true },
      { name: 'Concept 5', description: 'Desc 5', difficulty: 'medium', testable: true }
    ],
    criticalFacts: [
      { fact: 'Fact 1', category: 'definition', importance: 'high' },
      { fact: 'Fact 2', category: 'date', importance: 'medium' },
      { fact: 'Fact 3', category: 'process', importance: 'high' },
      { fact: 'Fact 4', category: 'relationship', importance: 'low' },
      { fact: 'Fact 5', category: 'definition', importance: 'high' }
    ],
    learningObjectives: [
      'Objective 1',
      'Objective 2',
      'Objective 3'
    ]
  };
  
  agent.validateExtractedConcepts(validConcepts);
  console.log('  ✅ Valid concepts pass validation');
  
  // Invalid concepts (too few mainTopics)
  const invalidConcepts = {
    mainTopics: ['Topic 1'],
    keyConcepts: validConcepts.keyConcepts,
    criticalFacts: validConcepts.criticalFacts,
    learningObjectives: validConcepts.learningObjectives
  };
  
  try {
    agent.validateExtractedConcepts(invalidConcepts);
    throw new Error('Should have thrown validation error');
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.log('  ✅ Invalid concepts caught by validation');
    } else {
      throw error;
    }
  }
  console.log();

  console.log('='.repeat(80));
  console.log('✅ All structure tests passed!');
  console.log('='.repeat(80));
  console.log();
  console.log('The Content Extraction Agent is properly implemented.');
  console.log('All required methods, properties, and validation logic are working correctly.');
  console.log();

} catch (error) {
  console.error('❌ Test failed:');
  console.error(`   Error: ${error.message}`);
  console.error();
  console.error('Stack trace:');
  console.error(error.stack);
  process.exit(1);
}
