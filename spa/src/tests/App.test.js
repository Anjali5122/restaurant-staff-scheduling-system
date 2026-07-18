import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

beforeEach(() => {
  global.fetch = jest.fn(url => {
    if (url.includes('/users')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }

    if (url.includes('/shifts')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }

    return Promise.reject(new Error('Unknown URL'));
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders app title', async () => {
  render(<App />);
  expect(screen.getByText('Restaurant Staff Scheduling')).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});