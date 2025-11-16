/**
 * Process Logger
 * 
 * Provides structured logging for the AI question generation pipeline.
 * Displays the entire process from subject detection to final questions.
 */

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

/**
 * Process Logger Class
 */
class ProcessLogger {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.verbose = options.verbose || false;
    this.startTime = Date.now();
    this.steps = [];
    this.currentStep = null;
  }

  /**
   * Format timestamp
   */
  getTimestamp() {
    const elapsed = Date.now() - this.startTime;
    return `[${elapsed}ms]`;
  }

  /**
   * Format duration
   */
  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  }

  /**
   * Log header
   */
  logHeader(title) {
    if (!this.enabled) return;
    
    const line = '='.repeat(80);
    console.log(`\n${colors.bright}${colors.blue}${line}${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}  ${title}${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}${line}${colors.reset}\n`);
  }

  /**
   * Log step start
   */
  logStepStart(stepNumber, stepName, description = '') {
    if (!this.enabled) return;
    
    this.currentStep = {
      number: stepNumber,
      name: stepName,
      startTime: Date.now(),
      description
    };

    console.log(`${colors.bright}${colors.cyan}━━━ Step ${stepNumber}: ${stepName} ━━━${colors.reset}`);
    if (description) {
      console.log(`${colors.dim}${description}${colors.reset}`);
    }
    console.log();
  }

  /**
   * Log step completion
   */
  logStepComplete(result = {}) {
    if (!this.enabled || !this.currentStep) return;
    
    const duration = Date.now() - this.currentStep.startTime;
    this.currentStep.duration = duration;
    this.currentStep.result = result;
    this.steps.push(this.currentStep);

    console.log(`${colors.green}✓ ${this.currentStep.name} completed in ${this.formatDuration(duration)}${colors.reset}`);
    
    if (Object.keys(result).length > 0) {
      console.log(`${colors.dim}Result:${colors.reset}`, JSON.stringify(result, null, 2));
    }
    
    console.log();
    this.currentStep = null;
  }

  /**
   * Log subject detection
   */
  logSubjectDetection(detection) {
    if (!this.enabled) return;

    console.log(`${colors.bright}${colors.magenta}📊 Subject Detection Result:${colors.reset}`);
    console.log(`   Subject: ${colors.bright}${colors.cyan}${detection.primarySubject}${colors.reset}`);
    console.log(`   Confidence: ${this.getConfidenceColor(detection.confidence)}${Math.round(detection.confidence * 100)}%${colors.reset}`);
    console.log(`   Method: ${colors.yellow}${detection.method}${colors.reset}`);
    console.log(`   Recommended Prompt: ${colors.green}${detection.recommendedPrompt}${colors.reset}`);
    
    if (detection.subDisciplines && detection.subDisciplines.length > 0) {
      console.log(`   Sub-disciplines: ${colors.dim}${detection.subDisciplines.join(', ')}${colors.reset}`);
    }
    
    if (detection.reasoning) {
      console.log(`   Reasoning: ${colors.dim}${detection.reasoning}${colors.reset}`);
    }

    if (detection.scores && this.verbose) {
      console.log(`\n   ${colors.dim}Keyword Scores:${colors.reset}`);
      Object.entries(detection.scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([subject, score]) => {
          const bar = '█'.repeat(Math.floor(score / 5));
          console.log(`     ${subject.padEnd(20)} ${bar} ${score}`);
        });
    }
    
    console.log();
  }

  /**
   * Get confidence color
   */
  getConfidenceColor(confidence) {
    if (confidence >= 0.8) return colors.green;
    if (confidence >= 0.6) return colors.yellow;
    return colors.red;
  }

  /**
   * Log content extraction
   */
  logContentExtraction(concepts) {
    if (!this.enabled) return;

    console.log(`${colors.bright}${colors.magenta}📝 Content Extraction Result:${colors.reset}`);
    console.log(`   Main Topics: ${colors.cyan}${concepts.mainTopics?.length || 0}${colors.reset}`);
    console.log(`   Key Concepts: ${colors.cyan}${concepts.keyConcepts?.length || 0}${colors.reset}`);
    console.log(`   Critical Facts: ${colors.cyan}${concepts.criticalFacts?.length || 0}${colors.reset}`);
    console.log(`   Learning Objectives: ${colors.cyan}${concepts.learningObjectives?.length || 0}${colors.reset}`);

    if (this.verbose && concepts.mainTopics) {
      console.log(`\n   ${colors.dim}Main Topics:${colors.reset}`);
      concepts.mainTopics.forEach((topic, i) => {
        console.log(`     ${i + 1}. ${topic}`);
      });
    }

    if (this.verbose && concepts.keyConcepts) {
      console.log(`\n   ${colors.dim}Key Concepts (sample):${colors.reset}`);
      concepts.keyConcepts.slice(0, 3).forEach((concept, i) => {
        console.log(`     ${i + 1}. ${concept.name} (${concept.difficulty})`);
      });
      if (concepts.keyConcepts.length > 3) {
        console.log(`     ... and ${concepts.keyConcepts.length - 3} more`);
      }
    }

    console.log();
  }

  /**
   * Log question generation
   */
  logQuestionGeneration(questions, distribution, promptKey) {
    if (!this.enabled) return;

    console.log(`${colors.bright}${colors.magenta}❓ Question Generation Result:${colors.reset}`);
    console.log(`   Prompt Used: ${colors.green}${promptKey}${colors.reset}`);
    console.log(`   Questions Generated: ${colors.cyan}${questions.length}${colors.reset}`);
    
    // Count by type
    const typeCount = {};
    questions.forEach(q => {
      typeCount[q.type] = (typeCount[q.type] || 0) + 1;
    });

    console.log(`\n   ${colors.dim}Distribution:${colors.reset}`);
    Object.entries(typeCount).forEach(([type, count]) => {
      const requested = distribution[type] || 0;
      const match = count === requested ? colors.green : colors.yellow;
      console.log(`     ${type.padEnd(20)} ${match}${count}${colors.reset} / ${requested} requested`);
    });

    if (this.verbose && questions.length > 0) {
      console.log(`\n   ${colors.dim}Sample Questions:${colors.reset}`);
      questions.slice(0, 2).forEach((q, i) => {
        console.log(`\n     ${colors.bright}Q${i + 1}:${colors.reset} ${q.question.substring(0, 80)}...`);
        console.log(`     Type: ${q.type}, Difficulty: ${q.difficulty || 'N/A'}`);
      });
      if (questions.length > 2) {
        console.log(`\n     ... and ${questions.length - 2} more questions`);
      }
    }

    console.log();
  }

  /**
   * Log quality validation
   */
  logQualityValidation(validationResults) {
    if (!this.enabled) return;

    const avgScore = validationResults.reduce((sum, r) => sum + r.score, 0) / validationResults.length;
    const passCount = validationResults.filter(r => r.passesQuality).length;
    const passRate = (passCount / validationResults.length) * 100;

    console.log(`${colors.bright}${colors.magenta}✅ Quality Validation Result:${colors.reset}`);
    console.log(`   Questions Validated: ${colors.cyan}${validationResults.length}${colors.reset}`);
    console.log(`   Average Score: ${this.getScoreColor(avgScore)}${Math.round(avgScore)}/100${colors.reset}`);
    console.log(`   Pass Rate: ${this.getPassRateColor(passRate)}${Math.round(passRate)}%${colors.reset}`);
    console.log(`   Questions Passing: ${colors.green}${passCount}${colors.reset} / ${validationResults.length}`);

    // Grade distribution
    const gradeCount = { excellent: 0, good: 0, fair: 0, poor: 0 };
    validationResults.forEach(r => {
      gradeCount[r.grade] = (gradeCount[r.grade] || 0) + 1;
    });

    console.log(`\n   ${colors.dim}Grade Distribution:${colors.reset}`);
    Object.entries(gradeCount).forEach(([grade, count]) => {
      if (count > 0) {
        const bar = '█'.repeat(count);
        const gradeColor = this.getGradeColor(grade);
        console.log(`     ${gradeColor}${grade.padEnd(10)}${colors.reset} ${bar} ${count}`);
      }
    });

    if (this.verbose) {
      const lowQuality = validationResults.filter(r => !r.passesQuality);
      if (lowQuality.length > 0) {
        console.log(`\n   ${colors.yellow}⚠ Low Quality Questions:${colors.reset}`);
        lowQuality.forEach((r, i) => {
          console.log(`     ${i + 1}. Score: ${r.score}/100 - ${r.questionText.substring(0, 60)}...`);
        });
      }
    }

    console.log();
  }

  /**
   * Get score color
   */
  getScoreColor(score) {
    if (score >= 85) return colors.green;
    if (score >= 70) return colors.yellow;
    return colors.red;
  }

  /**
   * Get pass rate color
   */
  getPassRateColor(rate) {
    if (rate >= 90) return colors.green;
    if (rate >= 70) return colors.yellow;
    return colors.red;
  }

  /**
   * Get grade color
   */
  getGradeColor(grade) {
    const gradeColors = {
      excellent: colors.green,
      good: colors.cyan,
      fair: colors.yellow,
      poor: colors.red
    };
    return gradeColors[grade] || colors.white;
  }

  /**
   * Log question improvement
   */
  logQuestionImprovement(improvementResults) {
    if (!this.enabled) return;

    const avgIncrease = improvementResults.reduce((sum, r) => 
      sum + (r.expectedScore - r.originalScore), 0
    ) / improvementResults.length;

    console.log(`${colors.bright}${colors.magenta}🔧 Question Improvement Result:${colors.reset}`);
    console.log(`   Questions Improved: ${colors.cyan}${improvementResults.length}${colors.reset}`);
    console.log(`   Average Score Increase: ${colors.green}+${Math.round(avgIncrease)}${colors.reset} points`);

    if (this.verbose && improvementResults.length > 0) {
      console.log(`\n   ${colors.dim}Improvements:${colors.reset}`);
      improvementResults.slice(0, 3).forEach((r, i) => {
        const increase = r.expectedScore - r.originalScore;
        console.log(`\n     ${i + 1}. ${r.originalQuestion.question.substring(0, 60)}...`);
        console.log(`        Score: ${r.originalScore} → ${r.expectedScore} (${colors.green}+${increase}${colors.reset})`);
        console.log(`        Changes: ${colors.dim}${r.changesSummary.substring(0, 80)}...${colors.reset}`);
      });
      if (improvementResults.length > 3) {
        console.log(`\n     ... and ${improvementResults.length - 3} more improvements`);
      }
    }

    console.log();
  }

  /**
   * Log AI provider info
   */
  logAIProvider(provider, executionTime, tokensUsed = null) {
    if (!this.enabled) return;

    console.log(`${colors.dim}   AI Provider: ${provider}${colors.reset}`);
    console.log(`${colors.dim}   Execution Time: ${this.formatDuration(executionTime)}${colors.reset}`);
    if (tokensUsed) {
      console.log(`${colors.dim}   Tokens Used: ${tokensUsed}${colors.reset}`);
    }
  }

  /**
   * Log error
   */
  logError(stepName, error) {
    if (!this.enabled) return;

    console.log(`${colors.red}✗ ${stepName} failed${colors.reset}`);
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    
    if (this.verbose && error.stack) {
      console.log(`${colors.dim}${error.stack}${colors.reset}`);
    }
    
    console.log();
  }

  /**
   * Log warning
   */
  logWarning(message) {
    if (!this.enabled) return;
    console.log(`${colors.yellow}⚠ Warning: ${message}${colors.reset}`);
  }

  /**
   * Log info
   */
  logInfo(message) {
    if (!this.enabled) return;
    console.log(`${colors.cyan}ℹ ${message}${colors.reset}`);
  }

  /**
   * Log success
   */
  logSuccess(message) {
    if (!this.enabled) return;
    console.log(`${colors.green}✓ ${message}${colors.reset}`);
  }

  /**
   * Log summary
   */
  logSummary() {
    if (!this.enabled) return;

    const totalDuration = Date.now() - this.startTime;
    
    console.log(`${colors.bright}${colors.blue}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}  Process Summary${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}${'='.repeat(80)}${colors.reset}\n`);

    console.log(`${colors.bright}Total Duration: ${colors.cyan}${this.formatDuration(totalDuration)}${colors.reset}\n`);

    if (this.steps.length > 0) {
      console.log(`${colors.bright}Steps Completed:${colors.reset}`);
      this.steps.forEach((step, i) => {
        const duration = this.formatDuration(step.duration);
        const percentage = ((step.duration / totalDuration) * 100).toFixed(1);
        console.log(`  ${i + 1}. ${step.name.padEnd(30)} ${colors.dim}${duration} (${percentage}%)${colors.reset}`);
      });
    }

    console.log(`\n${colors.bright}${colors.green}✓ Process completed successfully${colors.reset}\n`);
  }

  /**
   * Log progress bar
   */
  logProgress(current, total, label = '') {
    if (!this.enabled) return;

    const percentage = Math.round((current / total) * 100);
    const barLength = 40;
    const filledLength = Math.round((barLength * current) / total);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    process.stdout.write(`\r${label} [${bar}] ${percentage}% (${current}/${total})`);
    
    if (current === total) {
      console.log(); // New line when complete
    }
  }
}

export default ProcessLogger;
export { colors };
