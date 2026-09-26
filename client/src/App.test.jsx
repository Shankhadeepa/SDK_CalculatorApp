import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App.jsx';

function press(label) {
  fireEvent.click(screen.getByRole('button', { name: label }));
}

describe('Calculator UI', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('clicking number buttons updates the display', () => {
    render(<App />);
    const display = screen.getByTestId('display');

    expect(display).toHaveTextContent('0');
    press('7');
    press('8');
    press('.');
    press('5');
    expect(display).toHaveTextContent('78.5');
  });

  test('clicking "C" clears the display', () => {
    render(<App />);
    const display = screen.getByTestId('display');

    press('5');
    press('3');
    expect(display).toHaveTextContent('53');

    press('C');
    expect(display).toHaveTextContent('0');
  });

  test('pressing "=" calls the backend and shows the result', async () => {
    // Fake fetch: returns what the real backend would, without any network call
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 42 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);
    press('7');
    press('×');
    press('6');
    press('=');

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('42');
    });

    // The browser sent the inputs to the backend rather than doing the math itself
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:5000/api/calculate');
    expect(JSON.parse(options.body)).toEqual({ num1: 7, num2: 6, operator: '*' });
  });
});
