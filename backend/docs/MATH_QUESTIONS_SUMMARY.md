# Math Question Generation - Quick Summary

## What Was Added

A specialized AI prompt (`math-question-generation`) that creates **problem-solving math questions** with proper LaTeX notation.

## Key Differences from Regular Prompt

| Feature | Regular Prompt | Math Prompt |
|---------|---------------|-------------|
| **Focus** | General knowledge | Problem-solving & calculations |
| **Question Style** | "What is...?", "Which...?" | "Solve...", "Calculate...", "Find..." |
| **Notation** | Plain text | LaTeX mathematical notation |
| **Distractors** | General wrong answers | Based on calculation errors |
| **Verification** | Basic check | Step-by-step solution required |

## Examples

### ❌ Regular Prompt (Identification)
```
Question: "Which formula is used to calculate the area of a circle?"
Options: ["πr²", "2πr", "πd", "r²"]
```

### ✅ Math Prompt (Problem-Solving)
```
Question: "Calculate the area of a circle with radius $r = 5$ cm. Use $\pi \approx 3.14$."
Options: ["$78.5$ cm²", "$31.4$ cm²", "$15.7$ cm²", "$157$ cm²"]
Explanation: "Area = $\pi r^2 = 3.14 \times 5^2 = 3.14 \times 25 = 78.5$ cm²"
```

## Files Modified/Created

1. **`backend/config/ai-prompts.json`** - Added `math-question-generation` prompt
2. **`backend/docs/MATH_QUESTIONS.md`** - Comprehensive documentation
3. **`backend/src/examples/test-math-questions.js`** - Test script
4. **`backend/docs/MATH_QUESTIONS_SUMMARY.md`** - This file

## How to Use

### Automatic Detection (Recommended)

```javascript
function isMathContent(concepts) {
  const mathKeywords = [
    'equation', 'formula', 'calculate', 'solve', 'derivative',
    'integral', 'algebra', 'geometry', 'trigonometry', 'calculus'
  ];
  
  const conceptText = JSON.stringify(concepts).toLowerCase();
  return mathKeywords.some(keyword => conceptText.includes(keyword));
}

// In your question generation code
const promptKey = isMathContent(concepts) 
  ? 'math-question-generation' 
  : 'question-generation';

const promptData = promptManager.getPrompt(promptKey, {
  questionCount: 10,
  concepts: formattedConcepts,
  difficulty: 'medium'
});
```

### Manual Selection

```javascript
// Force math prompt
const promptData = promptManager.getPrompt('math-question-generation', {
  questionCount: 10,
  concepts: formattedConcepts,
  difficulty: 'medium'
});
```

## Testing

Run the test script:

```bash
cd backend
node src/examples/test-math-questions.js
```

Expected output:
- 5 math questions with LaTeX notation
- Problem-solving focus (not identification)
- Step-by-step explanations
- Realistic distractors based on calculation errors

## Frontend Requirements

Install a LaTeX renderer:

```bash
cd frontend
pnpm add katex react-katex
```

Use in components:

```tsx
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

function QuestionText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          return <InlineMath key={i} math={math} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
```

## LaTeX Quick Reference

| Type | LaTeX | Example |
|------|-------|---------|
| Fraction | `$\frac{a}{b}$` | a/b |
| Exponent | `$x^2$` | x² |
| Square root | `$\sqrt{x}$` | √x |
| Subscript | `$x_1$` | x₁ |
| Greek | `$\alpha$, $\pi$` | α, π |
| Trig | `$\sin(x)$` | sin(x) |
| Derivative | `$\frac{dy}{dx}$` | dy/dx |
| Integral | `$\int_a^b f(x)dx$` | ∫ᵃᵇ f(x)dx |

## Benefits

1. **Better Math Questions** - Tests problem-solving, not memorization
2. **Professional Appearance** - Proper mathematical notation
3. **Accurate Answers** - AI verifies calculations step-by-step
4. **Educational Distractors** - Based on common student errors
5. **Clear Explanations** - Step-by-step solutions included

## Next Steps

1. Test the math prompt with your content
2. Install LaTeX renderer in frontend
3. Update question generation to auto-detect math content
4. Consider adding subject-specific prompts (physics, chemistry, etc.)

## Support

For issues or questions:
- See full documentation: `backend/docs/MATH_QUESTIONS.md`
- Run test script: `node src/examples/test-math-questions.js`
- Check AI prompts: `backend/config/ai-prompts.json`
