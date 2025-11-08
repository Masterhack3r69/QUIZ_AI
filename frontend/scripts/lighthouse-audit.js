/**
 * Lighthouse Performance Audit Script
 * 
 * This script runs Lighthouse audits on the application to measure:
 * - LCP (Largest Contentful Paint) - Target: < 2.5s
 * - FID (First Input Delay) - Target: < 100ms
 * - CLS (Cumulative Layout Shift) - Target: < 0.1
 * 
 * Usage:
 * 1. Start the development server: pnpm dev
 * 2. Run this script: node scripts/lighthouse-audit.js
 * 
 * Or for production build:
 * 1. Build the app: pnpm build
 * 2. Start production server: pnpm start
 * 3. Run this script: node scripts/lighthouse-audit.js --prod
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Configuration
const isProd = process.argv.includes('--prod');
const BASE_URL = isProd ? 'http://localhost:3000' : 'http://localhost:3000';

// Pages to audit
const PAGES_TO_AUDIT = [
  { name: 'Home', url: '/' },
  { name: 'Login', url: '/login' },
  { name: 'Register', url: '/register' },
  { name: 'Join Quiz', url: '/join' },
  // Add more pages as needed
];

// Lighthouse configuration
const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10 * 1024,
      cpuSlowdownMultiplier: 1,
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
  },
};

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: 2500, // 2.5s
  FID: 100,  // 100ms
  CLS: 0.1,  // 0.1
  FCP: 1800, // 1.8s
  TTI: 3800, // 3.8s
  TBT: 200,  // 200ms
  SI: 3400,  // 3.4s
};

async function launchChromeAndRunLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(url, options, lighthouseConfig);
    await chrome.kill();
    return runnerResult;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

function evaluateMetric(value, threshold) {
  if (value <= threshold) {
    return { status: '✅ PASS', color: '\x1b[32m' };
  } else if (value <= threshold * 1.5) {
    return { status: '⚠️  WARN', color: '\x1b[33m' };
  } else {
    return { status: '❌ FAIL', color: '\x1b[31m' };
  }
}

function formatMetric(value, unit = 'ms') {
  if (unit === 'ms') {
    return `${Math.round(value)}ms`;
  } else if (unit === 's') {
    return `${(value / 1000).toFixed(2)}s`;
  } else {
    return value.toFixed(3);
  }
}

async function auditPage(pageName, url) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 Auditing: ${pageName} (${url})`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    const result = await launchChromeAndRunLighthouse(BASE_URL + url);
    const lhr = result.lhr;

    // Extract metrics
    const metrics = {
      LCP: lhr.audits['largest-contentful-paint'].numericValue,
      FID: lhr.audits['max-potential-fid']?.numericValue || 0,
      CLS: lhr.audits['cumulative-layout-shift'].numericValue,
      FCP: lhr.audits['first-contentful-paint'].numericValue,
      TTI: lhr.audits['interactive'].numericValue,
      TBT: lhr.audits['total-blocking-time'].numericValue,
      SI: lhr.audits['speed-index'].numericValue,
      performanceScore: lhr.categories.performance.score * 100,
    };

    // Display results
    console.log('📊 Performance Score:', `${Math.round(metrics.performanceScore)}/100\n`);

    console.log('Core Web Vitals:');
    console.log('─'.repeat(60));

    // LCP
    const lcpEval = evaluateMetric(metrics.LCP, THRESHOLDS.LCP);
    console.log(
      `${lcpEval.color}${lcpEval.status}\x1b[0m LCP: ${formatMetric(metrics.LCP)} (target: < ${formatMetric(THRESHOLDS.LCP)})`
    );

    // FID (using Max Potential FID as proxy)
    const fidEval = evaluateMetric(metrics.FID, THRESHOLDS.FID);
    console.log(
      `${fidEval.color}${fidEval.status}\x1b[0m FID: ${formatMetric(metrics.FID)} (target: < ${formatMetric(THRESHOLDS.FID)})`
    );

    // CLS
    const clsEval = evaluateMetric(metrics.CLS, THRESHOLDS.CLS);
    console.log(
      `${clsEval.color}${clsEval.status}\x1b[0m CLS: ${formatMetric(metrics.CLS, 'score')} (target: < ${THRESHOLDS.CLS})`
    );

    console.log('\nOther Metrics:');
    console.log('─'.repeat(60));

    // FCP
    const fcpEval = evaluateMetric(metrics.FCP, THRESHOLDS.FCP);
    console.log(
      `${fcpEval.color}${fcpEval.status}\x1b[0m FCP: ${formatMetric(metrics.FCP)} (target: < ${formatMetric(THRESHOLDS.FCP)})`
    );

    // TTI
    const ttiEval = evaluateMetric(metrics.TTI, THRESHOLDS.TTI);
    console.log(
      `${ttiEval.color}${ttiEval.status}\x1b[0m TTI: ${formatMetric(metrics.TTI)} (target: < ${formatMetric(THRESHOLDS.TTI)})`
    );

    // TBT
    const tbtEval = evaluateMetric(metrics.TBT, THRESHOLDS.TBT);
    console.log(
      `${tbtEval.color}${tbtEval.status}\x1b[0m TBT: ${formatMetric(metrics.TBT)} (target: < ${formatMetric(THRESHOLDS.TBT)})`
    );

    // SI
    const siEval = evaluateMetric(metrics.SI, THRESHOLDS.SI);
    console.log(
      `${siEval.color}${siEval.status}\x1b[0m SI:  ${formatMetric(metrics.SI)} (target: < ${formatMetric(THRESHOLDS.SI)})`
    );

    return {
      pageName,
      url,
      metrics,
      passed: lcpEval.status.includes('PASS') && fidEval.status.includes('PASS') && clsEval.status.includes('PASS'),
    };
  } catch (error) {
    console.error(`❌ Error auditing ${pageName}:`, error.message);
    return {
      pageName,
      url,
      error: error.message,
      passed: false,
    };
  }
}

async function runAudits() {
  console.log('\n🚀 Starting Lighthouse Performance Audits');
  console.log(`Environment: ${isProd ? 'Production' : 'Development'}`);
  console.log(`Base URL: ${BASE_URL}\n`);

  const results = [];

  for (const page of PAGES_TO_AUDIT) {
    const result = await auditPage(page.name, page.url);
    results.push(result);
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 AUDIT SUMMARY');
  console.log(`${'='.repeat(60)}\n`);

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  results.forEach((result) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.pageName}`);
  });

  console.log(`\nTotal: ${passedCount}/${totalCount} pages passed Core Web Vitals thresholds`);

  // Save results to file
  const resultsDir = path.join(__dirname, '../lighthouse-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(resultsDir, `audit-${timestamp}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  console.log(`\n💾 Results saved to: ${resultsFile}\n`);

  // Exit with error code if any audits failed
  process.exit(passedCount === totalCount ? 0 : 1);
}

// Check if required packages are installed
try {
  require.resolve('lighthouse');
  require.resolve('chrome-launcher');
} catch (e) {
  console.error('❌ Error: Required packages not installed.');
  console.error('Please install them with: pnpm add -D lighthouse chrome-launcher');
  process.exit(1);
}

// Run audits
runAudits().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
