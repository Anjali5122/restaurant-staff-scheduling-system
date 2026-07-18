import { fireEvent, render, screen } from '@testing-library/react';
import ShiftForm from '../../components/shiftForm';

describe('ShiftForm', () => {
  const baseProps = {
    closeShiftModal: jest.fn(),
    shiftForm: { role: 'Cook', userId: '1', day: '2026-07-18', startTime: '09:00', endTime: '17:00' },
    setShiftForm: jest.fn(),
    handleShiftFormChange: jest.fn(),
    roleOptions: ['Cook', 'Manager', 'Server'],
    shiftRoleUsers: [{ id: 1, name: 'Jane' }],
    shiftFormError: '',
    submitShiftForm: jest.fn(),
  };

  it('renders nothing when hidden', () => {
    const { container } = render(<ShiftForm {...baseProps} showShiftModal={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders fields and handles role/user/actions when visible', () => {
    render(<ShiftForm {...baseProps} showShiftModal />);

    expect(screen.getByRole('heading', { name: 'Add Shift' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Jane (#1)' })).toBeInTheDocument();

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'Server' } });
    expect(baseProps.setShiftForm).toHaveBeenCalled();

    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '1' } });
    expect(baseProps.handleShiftFormChange).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Cancel'));
    expect(baseProps.closeShiftModal).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Add Shift' }));
    expect(baseProps.submitShiftForm).toHaveBeenCalled();
  });
});