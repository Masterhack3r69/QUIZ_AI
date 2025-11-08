/**
 * Verification script for performance optimizations
 * Checks that all optimization files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

const checks = [];

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  checks.push({
    description,
    status: exists ? '✅ PASS' : '❌ FAIL',
    passed: exists,
  });
  return exists;
}

function checkFileContent(filePath, searchString, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const found = content.includes(searchString);
    checks.push({
      description,
      status: found ? '✅ PASS' : '❌ FAIL',
      passed: found,
    });
    return found;
  } catch (e) {
    checks.push({
      description,
      status: '❌ FAIL',
      passed: false,
    });
    return false;
  }
}

console.log('\n🔍 Verifying Performance Optimizations\n');
console.log('='.repeat(60));

// Check utility files
console.log('\n📁 Utility Files:');
checkFile('lib/dynamic-import.tsx', 'Dynamic import utility exists');
checkFile('lib/performance.ts', 'Performance monitoring utility exists');

// Check scripts
console.log('\n📜 Scripts:');
checkFile('scripts/lighthouse-audit.js', 'Lighthouse audit script exists');
checkFile('scripts/README.md', 'Scripts documentation exists');

// Check documentation
console.log('\n📚 Documentation:');
checkFile('PERFORMANCE_OPTIMIZATION.md', 'Performance optimization guide exists');
checkFile('TASK_27_PERFORMANCE_SUMMARY.md', 'Task summary exists');

// Check configuration
console.log('\n⚙️  Configuration:');
checkFileContent('next.config.ts', 'optimizePackageImports', 'Package import optimization configured');
checkFileContent('next.config.ts', 'splitChunks', 'Webpack bundle splitting configured');
checkFileContent('next.config.ts', 'formats: [\'image/avif\', \'image/webp\']', 'Image optimization configured');

// Check font optimization
console.log('\n🔤 Font Optimization:');
checkFileContent('app/layout.tsx', 'display: \'swap\'', 'Font display swap configured');
checkFileContent('app/layout.tsx', 'preload: true', 'Font preload configured');

// Check dynamic imports
console.log('\n📦 Dynamic Imports:');
checkFileContent('app/dashboard/create/page.tsx', 'dynamic(', 'Dynamic imports in create page');
checkFileContent('app/dashboard/create/page.tsx', 'ContentSourceSelector', 'ContentSourceSelector dynamically imported');
checkFileContent('app/dashboard/create/page.tsx', 'QuestionDistribution', 'QuestionDistribution dynamically imported');

// Check package.json scripts
console.log('\n🚀 NPM Scripts:');
checkFileContent('package.json', '"lighthouse":', 'Lighthouse script added to package.json');
checkFileContent('package.json', '"lighthouse:prod":', 'Lighthouse prod script added to package.json');

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Summary:\n');

const passedChecks = checks.filter(c => c.passed).length;
const totalChecks = checks.length;
const passRate = ((passedChecks / totalChecks) * 100).toFixed(1);

checks.forEach(check => {
  console.log(`${check.status} ${check.description}`);
});

console.log(`\n${passedChecks}/${totalChecks} checks passed (${passRate}%)\n`);

if (passedChecks === totalChecks) {
  console.log('✅ All performance optimizations are in place!\n');
  console.log('Next steps:');
  console.log('1. Build the application: pnpm build');
  console.log('2. Start production server: pnpm start');
  console.log('3. Run Lighthouse audit: pnpm lighthouse:prod\n');
  process.exit(0);
} else {
  console.log('❌ Some optimizations are missing. Please review the failed checks.\n');
  process.exit(1);
}
