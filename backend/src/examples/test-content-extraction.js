/**
 * Manual test for Content Extraction Agent
 * 
 * Run with: node src/examples/test-content-extraction.js
 */

import ContentExtractionAgent from '../services/agents/content-extraction-agent.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sample educational content
const sampleContent = `
Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water. Photosynthesis in plants generally involves the green pigment chlorophyll and generates oxygen as a byproduct.

The process of photosynthesis occurs in two main stages: the light-dependent reactions and the light-independent reactions (Calvin cycle). During the light-dependent reactions, which take place in the thylakoid membranes, light energy is converted to chemical energy in the form of ATP and NADPH. These reactions also produce oxygen as a waste product from the splitting of water molecules.

The light-independent reactions, also known as the Calvin cycle, occur in the stroma of the chloroplast. During this stage, the ATP and NADPH produced in the light-dependent reactions are used to convert carbon dioxide into glucose, a simple sugar that serves as an energy source for the plant.

The overall equation for photosynthesis can be written as:
6CO2 + 6H2O + light energy → C6H12O6 + 6O2

This means that six molecules of carbon dioxide and six molecules of water, using light energy, are converted into one molecule of glucose and six molecules of oxygen.

Photosynthesis is crucial for life on Earth as it is the primary source of oxygen in the atmosphere and forms the base of most food chains. Without photosynthesis, most life forms would not be able to survive.
`;

async function testContentExtraction() {
  console.log('='.repeat(80));
  console.log('Testing Content Extraction Agent');
  console.log('='.repeat(80));
  console.log();

  try {
    // Create agent instance
    const agent = new ContentExtractionAgent();

    console.log('📝 Sample Content:');
    console.log(sampleContent.substring(0, 200) + '...');
    console.log();
    console.log('🔄 Extracting concepts...');
    console.log();

    // Extract concepts
    const result = await agent.extractConcepts(sampleContent);

    console.log('✅ Extraction successful!');
    console.log();
    console.log('📊 Results:');
    console.log('='.repeat(80));
    console.log();

    console.log('🎯 Main Topics:', result.mainTopics.length);
    result.mainTopics.forEach((topic, i) => {
      console.log(`  ${i + 1}. ${topic}`);
    });
    console.log();

    console.log('💡 Key Concepts:', result.keyConcepts.length);
    result.keyConcepts.forEach((concept, i) => {
      console.log(`  ${i + 1}. ${concept.name} (${concept.difficulty})`);
      console.log(`     ${concept.description}`);
    });
    console.log();

    console.log('📌 Critical Facts:', result.criticalFacts.length);
    result.criticalFacts.forEach((fact, i) => {
      console.log(`  ${i + 1}. [${fact.category}] ${fact.fact}`);
    });
    console.log();

    console.log('🎓 Learning Objectives:', result.learningObjectives.length);
    result.learningObjectives.forEach((objective, i) => {
      console.log(`  ${i + 1}. ${objective}`);
    });
    console.log();

    if (result.exceptions && result.exceptions.length > 0) {
      console.log('⚠️  Exceptions:', result.exceptions.length);
      result.exceptions.forEach((exception, i) => {
        console.log(`  ${i + 1}. Rule: ${exception.rule}`);
        console.log(`     Exception: ${exception.exception}`);
      });
      console.log();
    }

    console.log('📈 Metadata:');
    console.log(`  Provider: ${result.metadata.provider}`);
    console.log(`  Execution Time: ${result.metadata.executionTime}ms`);
    console.log(`  Content Length: ${result.metadata.contentLength} chars`);
    console.log(`  Truncated: ${result.metadata.truncated}`);
    console.log();

    console.log('='.repeat(80));
    console.log('✅ Test completed successfully!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Test failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Type: ${error.name}`);
    
    if (error.validationDetails) {
      console.error('   Validation Details:', JSON.stringify(error.validationDetails, null, 2));
    }
    
    console.error();
    console.error('Stack trace:');
    console.error(error.stack);
    
    process.exit(1);
  }
}

// Run the test
testContentExtraction();
