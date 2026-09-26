import request from 'supertest';
import app from './app.js';

// Supertest sends requests straight to the Express app; no port or running server needed
describe('POST /api/calculate', () => {
  test.each([
    ['+', 2, 3, 5],
    ['-', 10, 4, 6],
    ['*', 7, 6, 42],
    ['/', 20, 4, 5],
  ])('%s: %d and %d returns %d', async (operator, num1, num2, expected) => {
    const res = await request(app).post('/api/calculate').send({ num1, num2, operator });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ result: expected });
  });

  test('dividing by zero returns an error response, not a crash', async () => {
    const res = await request(app)
      .post('/api/calculate')
      .send({ num1: 5, num2: 0, operator: '/' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Cannot divide by zero' });

    // The server should still handle requests afterwards
    const next = await request(app)
      .post('/api/calculate')
      .send({ num1: 1, num2: 1, operator: '+' });
    expect(next.body).toEqual({ result: 2 });
  });

  test('an invalid operator is handled gracefully', async () => {
    const res = await request(app)
      .post('/api/calculate')
      .send({ num1: 5, num2: 2, operator: '%' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/operator/);
  });
});
