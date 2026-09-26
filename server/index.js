import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Allow the React dev server (different port) to call this API
app.use(cors());
app.use(express.json());

// Accept real numbers or numeric strings; anything else becomes NaN
function toNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
}

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

app.listen(PORT, () => {
  console.log(`Calculator API running at http://localhost:${PORT}`);
});
