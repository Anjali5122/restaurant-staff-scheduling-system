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
        onMapShiftToUser={jest.fn()}
      />
    );

    expect(screen.getByText('No users yet. Add one above.')).toBeInTheDocument();
  });

  it('filters shifts by user role and triggers mapping callback', () => {
    const onMapShiftToUser = jest.fn();

    render(
      <UsersSections
        users={[
          { id: 1, name: 'Jane', role: 'Cook', email: 'jane@example.com', phone: '555-0100' },
        ]}
        shifts={[
          { id: 11, role: 'Cook', day: '2026-07-18', start_time: '09:00', end_time: '17:00' },
          { id: 12, role: 'Server', day: '2026-07-19', start_time: '10:00', end_time: '18:00' },
        ]}
        userShiftMap={{ 1: '11' }}
        userRoleById={{ 1: 'Cook' }}
        onMapShiftToUser={onMapShiftToUser}
      />
    );

    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '2026-07-18 09:00-17:00 (#11)' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '2026-07-19 10:00-18:00 (#12)' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '11' } });
    expect(onMapShiftToUser).toHaveBeenCalledWith(1, '11');
  });

  it('resolves shift role from shift data or user role fallback', () => {
    expect(getShiftRole({ role: 'Manager' }, {})).toBe('Manager');
    expect(getShiftRole({ user_id: 7 }, { 7: 'Server' })).toBe('Server');
    expect(getShiftRole({ user_id: 8 }, {})).toBe('');
  });
});