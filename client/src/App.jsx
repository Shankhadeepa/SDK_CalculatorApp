import { useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/calculate';

// Button label -> operator the backend expects
const OPERATORS = { '+': '+', '-': '-', '×': '*', '÷': '/' };
const SYMBOLS = { '+': '+', '-': '-', '*': '×', '/': '÷' };

// All math happens on the server; the browser only sends the inputs
async function calculate(num1, num2, operator) {
  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ num1: Number(num1), num2: Number(num2), operator }),
    });
  } catch {
    throw new Error('Cannot reach server');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Calculation failed');
  return String(data.result);
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [num1, setNum1] = useState(null);
  const [operator, setOperator] = useState(null);
  // true when the next digit should start a new number instead of appending
  const [overwrite, setOverwrite] = useState(true);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  function reset() {
    setDisplay('0');
    setNum1(null);
    setOperator(null);
    setOverwrite(true);
    setError(false);
  }

  function showError(message) {
    reset();
    setDisplay(message);
    setError(true);
  }

  function inputDigit(digit) {
    if (error || overwrite) {
      setDisplay(digit);
      setOverwrite(false);
      setError(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }

  function inputDecimal() {
    if (error || overwrite) {
      setDisplay('0.');
      setOverwrite(false);
      setError(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }

  async function chooseOperator(label) {
    if (error) return;
    const op = OPERATORS[label];

    // Chained input like "2 + 3 +": evaluate the pending operation first
    if (num1 !== null && operator && !overwrite) {
      setLoading(true);
      try {
        const result = await calculate(num1, display, operator);
        setDisplay(result);
        setNum1(result);
      } catch (err) {
        showError(err.message);
        return;
      } finally {
        setLoading(false);
      }
    } else {
      setNum1(display);
    }

    setOperator(op);
    setOverwrite(true);
  }

  async function handleEquals() {
    // Need a first number, an operator, and a freshly typed second number
    if (num1 === null || !operator || overwrite) return;

    setLoading(true);
    try {
      const result = await calculate(num1, display, operator);
      setDisplay(result);
      setNum1(null);
      setOperator(null);
      setOverwrite(true);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const expression = num1 !== null && operator ? `${num1} ${SYMBOLS[operator]}` : '';

  const digit = (d, className) => (
    <button className={className} onClick={() => inputDigit(d)} disabled={loading}>
      {d}
    </button>
  );
  const op = (label) => (
    <button className="operator" onClick={() => chooseOperator(label)} disabled={loading}>
      {label}
    </button>
  );

  return (
    <div className="calculator">
      <div className="display">
        <div className="expression">{expression}</div>
        <div className={error ? 'value error' : 'value'}>{display}</div>
      </div>

      <div className="keys">
        <button className="clear" onClick={reset} disabled={loading}>C</button>
        {op('÷')}
        {op('×')}

        {digit('7')}
        {digit('8')}
        {digit('9')}
        {op('-')}

        {digit('4')}
        {digit('5')}
        {digit('6')}
        {op('+')}

        {digit('1')}
        {digit('2')}
        {digit('3')}
        <button className="equals" onClick={handleEquals} disabled={loading}>=</button>

        {digit('0', 'zero')}
        <button onClick={inputDecimal} disabled={loading}>.</button>
      </div>
    </div>
  );
}
