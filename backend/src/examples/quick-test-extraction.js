/**
 * Quick test for Content Extraction Agent with timeout
 */

import ContentExtractionAgent from '../services/agents/content-extraction-agent.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleContent = `
Photosynthesis is the process by which green plants use sunlight to synthesize foods from carbon dioxide and water. 
The process occurs in two stages: light-dependent reactions and the Calvin cycle. 
During light-dependent reactions, light energy is converted to ATP and NADPH. 
The Calvin cycle uses ATP and NADPH to convert CO2 into glucose.
The overall equation is: 6CO2 + 6H2O + light → C6H12O6 + 6O2
`;

async function quickTest() {
  console.log('🧪 Quick Content Extraction Test');
  console.log('='.repeat(60));
  
  const agent = new ContentExtractionAgent();
  
  try {
    console.log('📝 Extracting concepts from sample content...');
    console.log(`   Content length: ${sampleContent.length} chars`);
    console.log(`   Using model: deepseek/deepseek-chat-v3.1:free`);
    console.log();
    
    const result = await agent.extractConcepts(sampleContent, {
      temperature: 0.3
    });
    
    console.log('✅ SUCCESS!');
    console.log();
    console.log(`📊 Extracted:`);
    console.log(`   - ${result.mainTopics.length} main topics`);
    console.log(`   - ${result.keyConcepts.length} key concepts`);
    console.log(`   - ${result.criticalFacts.length} critical facts`);
    console.log(`   - ${result.learningObjectives.length} learning objectives`);
    console.log();
    console.log(`⚡ Metadata:`);
    console.log(`   - Provider: ${result.metadata.provider}`);
    console.log(`   - Time: ${result.metadata.executionTime}ms`);
    console.log();
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    console.error('   Type:', error.name);
    if (error.validationDetails) {
      console.error('   Details:', JSON.stringify(error.validationDetails.errors, null, 2));
    }
    process.exit(1);
  }
}

// Set timeout
const timeout = setTimeout(() => {
  console.error('❌ Test timed out after 60 seconds');
  process.exit(1);
}, 60000);

quickTest().then(() => {
  clearTimeout(timeout);
  process.exit(0);
}).catch(error => {
  clearTimeout(timeout);
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
