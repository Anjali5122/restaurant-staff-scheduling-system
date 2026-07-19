import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

const mockUsersAndShifts = (users, shifts) => {
  global.fetch = jest.fn(url => {
    if (url.includes('/users')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(users) });
    }
    if (url.includes('/shifts')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(shifts) });
    }
    return Promise.reject(new Error('Unknown URL'));
  });
};

describe('same-day shift assignment conflicts', () => {
  const users = [
    { id: 1, name: 'Jane', email: 'jane@example.com', phone: '555-0100', role: 'Cook' },
  ];
  const shifts = [
    { id: 11, user_id: 1, role: 'Cook', day: '2026-07-20', start_time: '09:00', end_time: '17:00' },
    { id: 12, user_id: 1, role: 'Cook', day: '2026-07-20', start_time: '18:00', end_time: '22:00' },
    { id: 13, user_id: 1, role: 'Cook', day: '2026-07-21', start_time: '09:00', end_time: '17:00' },
  ];

  test('blocks assigning a second shift on a day already assigned, but allows a different day', async () => {
    mockUsersAndShifts(users, shifts);

    render(<App />);
    await screen.findByText('Jane');

    const [shift11Checkbox, shift12Checkbox, shift13Checkbox] = screen.getAllByRole('checkbox');

    fireEvent.click(shift11Checkbox);
    expect(shift11Checkbox).toBeChecked();
    expect(
      screen.getByText('2026-07-20 09:00-17:00 (#11)', { selector: '.assigned-shift-pill' })
    ).toBeInTheDocument();

    fireEvent.click(shift12Checkbox);
    expect(shift12Checkbox).not.toBeChecked();
    expect(
      screen.getByText('Already assigned to a shift on 2026-07-20 (#11). Shifts must be on different days.')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('2026-07-20 18:00-22:00 (#12)', { selector: '.assigned-shift-pill' })
    ).not.toBeInTheDocument();

    fireEvent.click(shift13Checkbox);
    expect(shift13Checkbox).toBeChecked();
    expect(
      screen.getByText('2026-07-21 09:00-17:00 (#13)', { selector: '.assigned-shift-pill' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Already assigned to a shift on 2026-07-20 (#11). Shifts must be on different days.')
    ).not.toBeInTheDocument();
  });

  test('unassigning a shift frees up its day for a previously conflicting shift', async () => {
    mockUsersAndShifts(users, shifts);

    render(<App />);
    await screen.findByText('Jane');

    const [shift11Checkbox, shift12Checkbox] = screen.getAllByRole('checkbox');

    fireEvent.click(shift11Checkbox);
    fireEvent.click(shift12Checkbox);
    expect(shift12Checkbox).not.toBeChecked();

    fireEvent.click(shift11Checkbox);
    expect(shift11Checkbox).not.toBeChecked();
    expect(
      screen.queryByText('2026-07-20 09:00-17:00 (#11)', { selector: '.assigned-shift-pill' })
    ).not.toBeInTheDocument();

    fireEvent.click(shift12Checkbox);
    expect(shift12Checkbox).toBeChecked();
    expect(
      screen.getByText('2026-07-20 18:00-22:00 (#12)', { selector: '.assigned-shift-pill' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Already assigned to a shift on 2026-07-20 (#11). Shifts must be on different days.')
    ).not.toBeInTheDocument();
  });
});