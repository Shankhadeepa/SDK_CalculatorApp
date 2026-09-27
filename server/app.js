import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

const app = express();

// Allow the React dev server (different port) to call this API
app.use(cors());
app.use(express.json());

// Interactive API docs, generated from the @openapi comments below
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Accept real numbers or numeric strings; anything else becomes NaN
function toNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
}

/**
 * @openapi
 * /api/calculate:
 *   post:
 *     summary: Perform a basic arithmetic calculation
 *     description: >
 *       Takes two numbers and an operator, performs the calculation on the
 *       server, and returns the result. Dividing by zero, an unsupported
 *       operator, or non-numeric inputs return a 400 error instead.
 *     tags:
 *       - Calculator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - num1
 *               - num2
 *               - operator
 *             properties:
 *               num1:
 *                 type: number
 *                 description: The first number
 *                 example: 7
 *               num2:
 *                 type: number
 *                 description: The second number
 *                 example: 6
 *               operator:
 *                 type: string
 *                 description: The operation to perform
 *                 enum: ["+", "-", "*", "/"]
 *                 example: "*"
 *     responses:
 *       200:
 *         description: Calculation succeeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: number
 *                   description: The result of the calculation
 *                   example: 42
 *       400:
 *         description: The request could not be calculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A human-readable explanation of what went wrong
 *             examples:
 *               divideByZero:
 *                 summary: Dividing by zero
 *                 value:
 *                   error: Cannot divide by zero
 *               invalidOperator:
 *                 summary: Unsupported operator (e.g. "%")
 *                 value:
 *                   error: 'operator must be one of "+", "-", "*", "/"'
 *               invalidNumbers:
 *                 summary: Missing or non-numeric num1/num2
 *                 value:
 *                   error: num1 and num2 must be valid numbers
 */
app.post('/api/calculate', (req, res) => {
  const { num1, num2, operator } = req.body ?? {};
  const a = toNumber(num1);
  const b = toNumber(num2);

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return res.status(400).json({ error: 'num1 and num2 must be valid numbers' });
  }

  let result;
  switch (operator) {
    case '+':
      result = a + b;
      break;
    case '-':
      result = a - b;
      break;
    case '*':
      result = a * b;
      break;
    case '/':
      if (b === 0) {
        return res.status(400).json({ error: 'Cannot divide by zero' });
      }
      result = a / b;
      break;
    default:
      return res.status(400).json({ error: 'operator must be one of "+", "-", "*", "/"' });
  }

  console.log(`${a} ${operator} ${b} = ${result}`);
  res.json({ result });
});

// Malformed JSON bodies land here instead of crashing the request
app.use((err, req, res, next) => {
  res.status(400).json({ error: 'Invalid JSON body' });
});

export default app;
