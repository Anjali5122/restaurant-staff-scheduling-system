import { fireEvent, render, screen } from '@testing-library/react';
import UsersForm from '../../components/usersForm';

describe('UsersForm', () => {
  const baseProps = {
    closeUserModal: jest.fn(),
    userForm: { name: 'Jane', email: 'jane@example.com', phone: '555-0100', role: 'Cook' },
    handleUserFormChange: jest.fn(),
    roleOptions: ['Cook', 'Manager', 'Server'],
    userFormError: '',
    submitUserForm: jest.fn(),
  };

  it('renders nothing when hidden', () => {
    const { container } = render(<UsersForm {...baseProps} showUserModal={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders fields and handles actions when visible', () => {
    render(<UsersForm {...baseProps} showUserModal />);

    expect(screen.getByRole('heading', { name: 'Add User' })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('e.g. Jane Smith'), { target: { value: 'Janet' } });
    expect(baseProps.handleUserFormChange).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Cancel'));
    expect(baseProps.closeUserModal).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Add User' }));
    expect(baseProps.submitUserForm).toHaveBeenCalled();
  });
});