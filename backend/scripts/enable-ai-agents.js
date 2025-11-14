/**
 * Enable AI Agents Script
 * 
 * This script enables the AI Agent Pipeline by updating the .env file
 * 
 * Usage: node scripts/enable-ai-agents.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ENV_PATH = path.join(__dirname, '../.env');

console.log('🤖 Enabling AI Agent Pipeline...\n');

try {
  // Read .env file
  let envContent = fs.readFileSync(ENV_PATH, 'utf8');
  
  // Track changes
  let changes = [];
  
  // Enable Agentic Pipeline
  if (envContent.includes('ENABLE_AGENTIC_PIPELINE=false')) {
    envContent = envContent.replace(
      'ENABLE_AGENTIC_PIPELINE=false',
      'ENABLE_AGENTIC_PIPELINE=true'
    );
    changes.push('✓ Enabled Agentic Pipeline');
  } else if (!envContent.includes('ENABLE_AGENTIC_PIPELINE=true')) {
    envContent += '\nENABLE_AGENTIC_PIPELINE=true';
    changes.push('✓ Added Agentic Pipeline flag');
  }
  
  // Enable Quality Validation
  if (envContent.includes('ENABLE_QUALITY_VALIDATION=false')) {
    envContent = envContent.replace(
      'ENABLE_QUALITY_VALIDATION=false',
      'ENABLE_QUALITY_VALIDATION=true'
    );
    changes.push('✓ Enabled Quality Validation');
  } else if (!envContent.includes('ENABLE_QUALITY_VALIDATION=true')) {
    envContent += '\nENABLE_QUALITY_VALIDATION=true';
    changes.push('✓ Added Quality Validation flag');
  }
  
  // Enable Question Improvement
  if (envContent.includes('ENABLE_QUESTION_IMPROVEMENT=false')) {
    envContent = envContent.replace(
      'ENABLE_QUESTION_IMPROVEMENT=false',
      'ENABLE_QUESTION_IMPROVEMENT=true'
    );
    changes.push('✓ Enabled Question Improvement');
  } else if (!envContent.includes('ENABLE_QUESTION_IMPROVEMENT=true')) {
    envContent += '\nENABLE_QUESTION_IMPROVEMENT=true';
    changes.push('✓ Added Question Improvement flag');
  }
  
  // Write back to .env
  fs.writeFileSync(ENV_PATH, envContent);
  
  console.log('Changes made:');
  changes.forEach(change => console.log(`  ${change}`));
  
  console.log('\n✅ AI Agent Pipeline has been enabled!');
  console.log('\n⚠️  Important: You need to restart the backend server for changes to take effect.');
  console.log('   Run: pnpm dev\n');
  
} catch (error) {
  console.error('❌ Error enabling AI agents:', error.message);
  process.exit(1);
}
