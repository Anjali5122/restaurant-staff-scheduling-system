import { render, screen } from '@testing-library/react';
import ShiftsSection from '../../components/shiftsSection';

describe('ShiftsSection', () => {
  it('renders empty state when there are no shifts', () => {
    render(
      <ShiftsSection
        shifts={[]}
        shiftToUserMap={{}}
        userNameById={{}}
        userRoleById={{}}
        getShiftRole={jest.fn()}
      />
    );

    expect(screen.getByText('No shifts yet. Add one above.')).toBeInTheDocument();
  });

  it('renders assigned and unassigned shifts with role information', () => {
    const getShiftRole = jest.fn(shift => shift.role || 'Cook');

    render(
      <ShiftsSection
        shifts={[
          { id: 1, day: '2026-07-20', start_time: '09:00', end_time: '17:00', role: 'Cook' },
          { id: 2, day: '2026-07-21', start_time: '10:00', end_time: '18:00', role: 'Server' },
        ]}
        shiftToUserMap={{ 1: '99' }}
        userNameById={{ 99: 'Alex' }}
        userRoleById={{}}
        getShiftRole={getShiftRole}
      />
    );

    expect(screen.getByText('Assigned to Alex')).toBeInTheDocument();
    expect(screen.getByText('Unassigned to a user')).toBeInTheDocument();
    expect(screen.getByText('09:00 - 17:00 • #1 • Cook')).toBeInTheDocument();
    expect(screen.getByText('10:00 - 18:00 • #2 • Server')).toBeInTheDocument();
  });
});