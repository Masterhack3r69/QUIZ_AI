# Math Question Generation Guide

## Overview

The system includes a specialized prompt for generating **problem-solving math questions** with proper LaTeX notation. This ensures students are tested on their ability to solve problems and calculate answers, not just identify formulas or definitions.

## Problem Fixed

### Before ❌
The AI was generating **identification questions**:
- "Which formula is correct?"
- "What is the quadratic formula?"
- "Identify the correct equation"

### After ✅
The AI now generates **problem-solving questions**:
- "Solve for $x$: $2x + 5 = 13$"
- "Calculate the area of a circle with radius $r = 5$ cm"
- "Find the derivative of $f(x) = 3x^2 + 2x - 1$"

## Key Features

### 1. Problem-Solving Focus

The prompt explicitly emphasizes creating questions that require:
- **Calculations** - Students must work through problems
- **Application** - Students must apply formulas and concepts
- **Step-by-step reasoning** - Not just memorization

### 2. LaTeX Support

All mathematical expressions use proper LaTeX notation:

| Type | LaTeX | Renders As |
|------|-------|------------|
| Inline math | `$x^2$` | x² |
| Fractions | `$\frac{a}{b}$` | a/b |
| Square roots | `$\sqrt{x}$` | √x |
| Exponents | `$x^{2n}$` | x²ⁿ |
| Subscripts | `$x_1$` | x₁ |
| Greek letters | `$\alpha$, $\pi$, $\theta$` | α, π, θ |
| Trigonometry | `$\sin(x)$, $\cos(x)$` | sin(x), cos(x) |
| Derivatives | `$\frac{dy}{dx}$` | dy/dx |
| Integrals | `$\int_a^b f(x)dx$` | ∫ᵃᵇ f(x)dx |
| Summation | `$\sum_{i=1}^{n} i$` | Σⁿᵢ₌₁ i |
| Inequalities | `$\leq$, $\geq$, $\neq$` | ≤, ≥, ≠ |
| Sets | `$\in$, $\subset$, $\cup$` | ∈, ⊂, ∪ |

### 3. Answer Verification

The prompt requires the AI to:
- Work through problems step-by-step
- Verify answers are mathematically correct
- Include detailed solutions in explanations
- Double-check all calculations

### 4. Realistic Distractors

Wrong answers are based on common student errors:
- **Sign errors**: $-4$ instead of $4$
- **Arithmetic mistakes**: $2 \times 3 = 5$
- **Order of operations**: $(2+3) \times 4 = 14$ vs $2+3 \times 4 = 14$
- **Formula confusion**: Using circumference formula for area
- **Incomplete simplification**: $\frac{4}{8}$ instead of $\frac{1}{2}$

## Example Questions

### Algebra - Linear Equations
```json
{
  "question": "Solve for $x$: $2x + 5 = 13$",
  "type": "multipleChoice",
  "options": ["$x = 4$", "$x = 9$", "$x = 6.5$", "$x = 3$"],
  "correctAnswer": 0,
  "explanation": "Step 1: Subtract 5 from both sides: $2x = 8$. Step 2: Divide both sides by 2: $x = 4$.",
  "difficulty": "easy",
  "distractorTypes": ["arithmeticError", "signError", "orderOfOperationsError"]
}
```

### Geometry - Area Calculation
```json
{
  "question": "Calculate the area of a circle with radius $r = 5$ cm. Use $\\pi \\approx 3.14$.",
  "type": "multipleChoice",
  "options": ["$78.5$ cm²", "$31.4$ cm²", "$15.7$ cm²", "$157$ cm²"],
  "correctAnswer": 0,
  "explanation": "Area = $\\pi r^2 = 3.14 \\times 5^2 = 3.14 \\times 25 = 78.5$ cm²",
  "difficulty": "medium",
  "distractorTypes": ["usedCircumferenceFormula", "forgotToSquare", "arithmeticError"]
}
```

### Calculus - Derivatives
```json
{
  "question": "Find the derivative of $f(x) = 3x^2 + 2x - 1$",
  "type": "multipleChoice",
  "options": ["$f'(x) = 6x + 2$", "$f'(x) = 3x + 2$", "$f'(x) = 6x^2 + 2x$", "$f'(x) = 6x - 1$"],
  "correctAnswer": 0,
  "explanation": "Using power rule: $\\frac{d}{dx}(3x^2) = 6x$, $\\frac{d}{dx}(2x) = 2$, $\\frac{d}{dx}(-1) = 0$. Therefore, $f'(x) = 6x + 2$.",
  "difficulty": "medium",
  "distractorTypes": ["forgotToMultiplyByExponent", "didNotReduceExponent", "forgotConstantDerivativeIsZero"]
}
```

### Trigonometry
```json
{
  "question": "If $\\sin(\\theta) = 0.5$ and $0° \\leq \\theta \\leq 90°$, what is $\\theta$?",
  "type": "multipleChoice",
  "options": ["$30°$", "$45°$", "$60°$", "$90°$"],
  "correctAnswer": 0,
  "explanation": "$\\sin(30°) = 0.5$ is a standard trigonometric value.",
  "difficulty": "easy",
  "distractorTypes": ["confusedWithCos45", "confusedWithSin60", "confusedWithSin90"]
}
```

### Fractions
```json
{
  "question": "Evaluate: $\\frac{2}{3} + \\frac{1}{4}$",
  "type": "multipleChoice",
  "options": ["$\\frac{11}{12}$", "$\\frac{3}{7}$", "$\\frac{5}{12}$", "$\\frac{2}{12}$"],
  "correctAnswer": 0,
  "explanation": "Find common denominator: $\\frac{2}{3} = \\frac{8}{12}$ and $\\frac{1}{4} = \\frac{3}{12}$. Then $\\frac{8}{12} + \\frac{3}{12} = \\frac{11}{12}$.",
  "difficulty": "easy",
  "distractorTypes": ["addedNumeratorsAndDenominators", "wrongCommonDenominator", "arithmeticError"]
}
```

### Fill in the Blank
```json
{
  "question": "The equation $x^2 - 5x + 6 = 0$ has two solutions. One solution is $x = 2$. What is the other solution?",
  "type": "fillInBlank",
  "correctAnswer": "3",
  "caseSensitive": false,
  "explanation": "Factor: $(x-2)(x-3) = 0$. Solutions are $x = 2$ and $x = 3$.",
  "difficulty": "medium"
}
```

### True/False
```json
{
  "question": "For any real number $x$, the equation $x^2 = -1$ has no real solutions.",
  "type": "trueFalse",
  "options": ["True", "False"],
  "correctAnswer": 0,
  "explanation": "True. The square of any real number is non-negative, so $x^2 \\geq 0$ for all real $x$. Therefore $x^2 = -1$ has no real solutions (only complex solutions).",
  "difficulty": "medium"
}
```

## How to Use

### Backend Configuration

The math question generation prompt is available in `backend/config/ai-prompts.json` under the key `math-question-generation`.

To use it in your code:

```javascript
import PromptManager from './services/prompt-manager.js';

const promptManager = new PromptManager();

// Get the math-specific prompt
const mathPrompt = promptManager.getPrompt('math-question-generation', {
  questionCount: 10,
  concepts: formattedConcepts,
  difficulty: 'medium'
});
```

### Automatic Detection

You can automatically detect if content is math-related and use the appropriate prompt:

```javascript
function isMathContent(concepts) {
  const mathKeywords = [
    'equation', 'formula', 'calculate', 'solve', 'derivative',
    'integral', 'algebra', 'geometry', 'trigonometry', 'calculus',
    'function', 'graph', 'theorem', 'proof', 'variable'
  ];
  
  const conceptText = JSON.stringify(concepts).toLowerCase();
  return mathKeywords.some(keyword => conceptText.includes(keyword));
}

// Use appropriate prompt
const promptKey = isMathContent(concepts) 
  ? 'math-question-generation' 
  : 'question-generation';
```

### Integration with Question Generation Agent

Update the Question Generation Agent to support math-specific prompts:

```javascript
async generateQuestions(concepts, distribution, totalQuestions, options = {}) {
  // Detect if math content
  const isMath = this.isMathContent(concepts);
  const promptKey = isMath ? 'math-question-generation' : 'question-generation';
  
  // Get appropriate prompt
  const promptData = this.promptManager.getPrompt(promptKey, {
    questionCount: totalQuestions,
    concepts: this.formatConceptsForPrompt(concepts),
    difficulty: options.difficulty || 'mixed'
  });
  
  // Continue with generation...
}
```

## Frontend Requirements

To display LaTeX properly, install a LaTeX renderer:

### Option 1: KaTeX (Recommended - Faster)

```bash
cd frontend
pnpm add katex react-katex
```

```tsx
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Inline math
<InlineMath math="x^2 + y^2 = z^2" />

// Block math (centered)
<BlockMath math="\int_a^b f(x)dx" />
```

### Option 2: MathJax (More Features)

```bash
cd frontend
pnpm add react-mathjax2
```

```tsx
import MathJax from 'react-mathjax2';

<MathJax.Context>
  <MathJax.Node inline>{'x^2 + y^2 = z^2'}</MathJax.Node>
</MathJax.Context>
```

### Automatic LaTeX Rendering

Create a component that automatically detects and renders LaTeX:

```tsx
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

function MathText({ text }: { text: string }) {
  // Split text by $ delimiters
  const parts = text.split(/(\$[^$]+\$)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          // Remove $ delimiters and render as math
          const math = part.slice(1, -1);
          return <InlineMath key={i} math={math} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// Usage
<MathText text="Solve for $x$: $2x + 5 = 13$" />
```

## Testing

Test the math question generation:

```javascript
// backend/src/examples/test-math-questions.js
import QuestionGenerationAgent from '../services/agents/question-generation-agent.js';
import PromptManager from '../services/prompt-manager.js';

const agent = new QuestionGenerationAgent();
const promptManager = new PromptManager();

const mathConcepts = {
  mainTopics: ['Algebra', 'Linear Equations'],
  keyConcepts: [
    {
      name: 'Solving linear equations',
      description: 'Finding the value of x that satisfies ax + b = c',
      difficulty: 'easy'
    }
  ],
  criticalFacts: [
    { fact: 'To isolate x, perform inverse operations on both sides' }
  ],
  learningObjectives: [
    'Students will be able to solve one-step and two-step linear equations'
  ]
};

// Use math-specific prompt
const promptData = promptManager.getPrompt('math-question-generation', {
  questionCount: 5,
  concepts: JSON.stringify(mathConcepts, null, 2),
  difficulty: 'medium'
});

const questions = await agent.generateQuestions(
  mathConcepts,
  { multipleChoice: 4, fillInBlank: 1 },
  5,
  { forceProvider: 'github' }
);

console.log(JSON.stringify(questions, null, 2));
```

## Best Practices

1. **Always verify answers** - Math questions must have correct solutions
2. **Include step-by-step explanations** - Help students understand the process
3. **Use realistic distractors** - Based on common student errors
4. **Test understanding, not memorization** - Focus on problem-solving
5. **Use proper LaTeX notation** - Ensures professional appearance
6. **Provide context** - Include units, constraints, and clear instructions
7. **Vary difficulty** - Mix easy, medium, and hard problems

## Common LaTeX Patterns

### Equations
```latex
$2x + 5 = 13$
$ax^2 + bx + c = 0$
$y = mx + b$
```

### Fractions
```latex
$\frac{a}{b}$
$\frac{x^2 + 1}{x - 1}$
```

### Exponents and Roots
```latex
$x^2$, $x^{2n}$
$\sqrt{x}$, $\sqrt[3]{x}$
```

### Calculus
```latex
$\frac{dy}{dx}$
$\int_a^b f(x)dx$
$\lim_{x \to 0} f(x)$
$\sum_{i=1}^{n} i$
```

### Trigonometry
```latex
$\sin(x)$, $\cos(x)$, $\tan(x)$
$\sin^{-1}(x)$ or $\arcsin(x)$
```

### Greek Letters
```latex
$\alpha$, $\beta$, $\gamma$, $\delta$
$\theta$, $\phi$, $\pi$, $\omega$
```

## Troubleshooting

### LaTeX Not Rendering
- Ensure KaTeX or MathJax is installed
- Check that CSS is imported
- Verify $ delimiters are present
- Test with simple expression first: `$x^2$`

### Wrong Answers Generated
- Check the AI provider's math capabilities
- Use higher-quality models (GPT-4, Claude)
- Add more examples to the prompt
- Verify calculations manually

### Distractors Too Obvious
- Ensure distractors are based on realistic errors
- Make all options similar in format
- Use actual calculation mistakes
- Test with students to validate plausibility

## Future Enhancements

- [ ] Support for matrix notation
- [ ] Chemical equations support
- [ ] Physics formulas with units
- [ ] Graph generation for geometry problems
- [ ] Step-by-step solution visualization
- [ ] Interactive problem solving
- [ ] Automatic answer verification
- [ ] Multi-step problem generation
