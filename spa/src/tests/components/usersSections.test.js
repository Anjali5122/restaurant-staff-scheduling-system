import { fireEvent, render, screen } from '@testing-library/react';
import UsersSections, { getShiftRole } from '../../components/usersSections';

describe('UsersSections', () => {
  it('renders empty state when there are no users', () => {
    render(
      <UsersSections
        users={[]}
        shifts={[]}
        userShiftMap={{}}
        userRoleById={{}}
        onToggleShiftAssignment={jest.fn()}
        assignmentErrors={{}}
      />
    );

    expect(screen.getByText('No users yet. Add one above.')).toBeInTheDocument();
  });

  it('filters shifts by user role, shows checkboxes, and triggers the toggle callback', () => {
    const onToggleShiftAssignment = jest.fn();

    render(
      <UsersSections
        users={[
          { id: 1, name: 'Jane', role: 'Cook', email: 'jane@example.com', phone: '555-0100' },
        ]}
        shifts={[
          { id: 11, role: 'Cook', day: '2026-07-18', start_time: '09:00', end_time: '17:00' },
          { id: 12, role: 'Cook', day: '2026-07-19', start_time: '10:00', end_time: '18:00' },
          { id: 13, role: 'Server', day: '2026-07-20', start_time: '10:00', end_time: '18:00' },
        ]}
        userShiftMap={{ 1: ['11'] }}
        userRoleById={{ 1: 'Cook' }}
        onToggleShiftAssignment={onToggleShiftAssignment}
        assignmentErrors={{}}
      />
    );

    expect(screen.getByText('Jane')).toBeInTheDocument();
    // #11 is assigned, so it renders both as a pill and as a checked checkbox label.
    expect(screen.getAllByText('2026-07-18 09:00-17:00 (#11)')).toHaveLength(2);
    expect(screen.getByText('2026-07-19 10:00-18:00 (#12)')).toBeInTheDocument();
    expect(screen.queryByText('2026-07-20 10:00-18:00 (#13)')).not.toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();

    fireEvent.click(checkboxes[1]);
    expect(onToggleShiftAssignment).toHaveBeenCalledWith(1, 12, true);

    fireEvent.click(checkboxes[0]);
    expect(onToggleShiftAssignment).toHaveBeenCalledWith(1, 11, false);
  });

  it('shows all shifts assigned to a user and an assignment error message', () => {
    render(
      <UsersSections
        users={[
          { id: 1, name: 'Jane', role: 'Cook', email: 'jane@example.com', phone: '555-0100' },
        ]}
        shifts={[
          { id: 11, role: 'Cook', day: '2026-07-18', start_time: '09:00', end_time: '17:00' },
          { id: 12, role: 'Cook', day: '2026-07-19', start_time: '10:00', end_time: '18:00' },
        ]}
        userShiftMap={{ 1: ['11', '12'] }}
        userRoleById={{ 1: 'Cook' }}
        onToggleShiftAssignment={jest.fn()}
        assignmentErrors={{ 1: 'Already assigned to a shift on 2026-07-18 (#11). Shifts must be on different days.' }}
      />
    );

    expect(screen.getByText('2026-07-18 09:00-17:00 (#11)', { selector: '.assigned-shift-pill' })).toBeInTheDocument();
    expect(screen.getByText('2026-07-19 10:00-18:00 (#12)', { selector: '.assigned-shift-pill' })).toBeInTheDocument();
    expect(
      screen.getByText('Already assigned to a shift on 2026-07-18 (#11). Shifts must be on different days.')
    ).toBeInTheDocument();
  });

  it('resolves shift role from shift data or user role fallback', () => {
    expect(getShiftRole({ role: 'Manager' }, {})).toBe('Manager');
    expect(getShiftRole({ user_id: 7 }, { 7: 'Server' })).toBe('Server');
    expect(getShiftRole({ user_id: 8 }, {})).toBe('');
  });
});
