const math = require("mathjs");

async function calculate(expression) {
  try {
    // Preprocess common natural language patterns
    let processedExpression = expression
      .replace(/(\d+)%\s+of\s+/gi, "($1/100) * ") // "15% of 66" → "(15/100) * 66"
      .replace(/percent\s+of/gi, "/ 100 *") // "15 percent of 66"
      .replace(/\s+to\s+/gi, " to ") // Keep "to" for conversions
      .trim();

    // Evaluate the mathematical expression
    const result = math.evaluate(processedExpression);

    return {
      expression: expression,
      result: result,
    };
  } catch (error) {
    throw new Error(`Unable to calculate: ${error.message}`);
  }
}

module.exports = { calculate };
