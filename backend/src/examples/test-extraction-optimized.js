/**
 * Optimized test for Content Extraction Agent
 * Uses shorter content and reduced token limits
 */

import ContentExtractionAgent from '../services/agents/content-extraction-agent.js';
import dotenv from 'dotenv';

dotenv.config();

// Shorter sample content (under 500 chars)
const shortContent = `
Photosynthesis converts light energy into chemical energy. Plants use chlorophyll to capture sunlight. 
The process has two stages: light reactions produce ATP and NADPH, while the Calvin cycle uses these 
to convert CO2 into glucose. The equation is: 6CO2 + 6H2O + light → C6H12O6 + 6O2.
`;

async function testWithOptimizedSettings() {
  console.log('🧪 Optimized Content Extraction Test');
  console.log('='.repeat(60));
  
  const agent = new ContentExtractionAgent();
  
  try {
    console.log('📝 Test Configuration:');
    console.log(`   Content length: ${shortContent.length} chars`);
    console.log(`   Max tokens: 800 (reduced from 2000)`);
    console.log(`   Temperature: 0.3`);
    console.log(`   JSON mode: enabled`);
    console.log();
    
    console.log('🔄 Extracting concepts...');
    
    const result = await agent.extractConcepts(shortContent, {
      temperature: 0.3,
      maxTokens: 800  // Reduced from 2000
    });
    
    console.log();
    console.log('✅ SUCCESS!');
    console.log('='.repeat(60));
    console.log();
    console.log(`📊 Results:`);
    console.log(`   Main Topics: ${result.mainTopics.length}`);
    result.mainTopics.forEach((topic, i) => {
      console.log(`      ${i + 1}. ${topic}`);
    });
    console.log();
    
    console.log(`   Key Concepts: ${result.keyConcepts.length}`);
    result.keyConcepts.slice(0, 3).forEach((concept, i) => {
      console.log(`      ${i + 1}. ${concept.name} (${concept.difficulty})`);
    });
    if (result.keyConcepts.length > 3) {
      console.log(`      ... and ${result.keyConcepts.length - 3} more`);
    }
    console.log();
    
    console.log(`   Critical Facts: ${result.criticalFacts.length}`);
    console.log(`   Learning Objectives: ${result.learningObjectives.length}`);
    console.log();
    
    console.log(`⚡ Performance:`);
    console.log(`   Provider: ${result.metadata.provider}`);
    console.log(`   Execution Time: ${result.metadata.executionTime}ms`);
    console.log();
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error();
    console.error('❌ FAILED:', error.message);
    console.error('   Type:', error.name);
    
    if (error.attemptedProviders) {
      console.error('   Attempted providers:', error.attemptedProviders.join(', '));
    }
    
    if (error.validationDetails) {
      console.error('   Validation errors:', error.validationDetails.errors);
    }
    
    process.exit(1);
  }
}

// Set timeout
const timeout = setTimeout(() => {
  console.error('❌ Test timed out after 60 seconds');
  process.exit(1);
}, 60000);

testWithOptimizedSettings().then(() => {
  clearTimeout(timeout);
  console.log('✅ Test completed successfully!');
  process.exit(0);
}).catch(error => {
  clearTimeout(timeout);
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
