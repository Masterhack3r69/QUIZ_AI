/**
 * Test Content Extraction Agent with Gemini directly
 * Bypasses OpenRouter issues
 */

import ContentExtractionAgent from '../services/agents/content-extraction-agent.js';
import dotenv from 'dotenv';

dotenv.config();

const shortContent = `
Photosynthesis converts light energy into chemical energy. Plants use chlorophyll to capture sunlight. 
The process has two stages: light reactions produce ATP and NADPH, while the Calvin cycle uses these 
to convert CO2 into glucose. The equation is: 6CO2 + 6H2O + light → C6H12O6 + 6O2.
`;

async function testWithGemini() {
  console.log('🧪 Content Extraction Test (Gemini Direct)');
  console.log('='.repeat(60));
  
  const agent = new ContentExtractionAgent();
  
  try {
    console.log('📝 Configuration:');
    console.log(`   Content: ${shortContent.length} chars`);
    console.log(`   Provider: Gemini (forced)`);
    console.log(`   Max tokens: 800`);
    console.log();
    
    console.log('🔄 Extracting concepts...');
    console.log('   (Waiting for Gemini rate limit to reset...)');
    console.log();
    
    const result = await agent.extractConcepts(shortContent, {
      forceProvider: 'gemini',  // Force Gemini, bypass OpenRouter
      temperature: 0.3,
      maxTokens: 800
    });
    
    console.log('✅ SUCCESS!');
    console.log('='.repeat(60));
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
    console.log('✅ Content Extraction Agent is working correctly!');
    
  } catch (error) {
    console.error();
    console.error('❌ FAILED:', error.message);
    
    if (error.message.includes('rate limit')) {
      console.error();
      console.error('ℹ️  Gemini rate limit not reset yet. Wait ~1 minute and try again.');
    }
    
    process.exit(1);
  }
}

const timeout = setTimeout(() => {
  console.error('❌ Timeout');
  process.exit(1);
}, 60000);

testWithGemini().then(() => {
  clearTimeout(timeout);
  process.exit(0);
}).catch(error => {
  clearTimeout(timeout);
  console.error('❌ Error:', error);
  process.exit(1);
});
