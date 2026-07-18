import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
const ROLE_OPTIONS = ['Cook', 'Manager', 'Server'];
const EMPTY_USER_FORM = { name: '', email: '', phone: '', role: 'Cook' };
const EMPTY_SHIFT_FORM = { role: 'Cook', userId: '', day: '', startTime: '', endTime: '' };

function App() {
  const [users, setUsers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [userShiftMap, setUserShiftMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);
  const [userFormError, setUserFormError] = useState('');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftForm, setShiftForm] = useState(EMPTY_SHIFT_FORM);
  const [shiftFormError, setShiftFormError] = useState('');

  const roleOptions = ROLE_OPTIONS;

  const fetchUsers = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to load users.');
    }
    const data = await response.json();
    setUsers(data);
    return data;
  }, []);

  const fetchShifts = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/shifts`);
    if (!response.ok) {
      throw new Error('Failed to load shifts.');
    }
    const data = await response.json();
    setShifts(data);
    return data;
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setGlobalError('');
      await Promise.all([fetchUsers(), fetchShifts()]);
    } catch (error) {
      setGlobalError(error.message || 'Failed to connect to API.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers, fetchShifts]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const nextMap = {};
    const validUserIds = new Set(users.map(user => String(user.id)));
    const validShiftIds = new Set(shifts.map(shift => String(shift.id)));

    Object.entries(userShiftMap).forEach(([userId, shiftId]) => {
      if (validUserIds.has(userId) && validShiftIds.has(String(shiftId))) {
        nextMap[userId] = String(shiftId);
      }
    });

    const changed = JSON.stringify(nextMap) !== JSON.stringify(userShiftMap);
    if (changed) {
      setUserShiftMap(nextMap);
    }
  }, [users, shifts, userShiftMap]);

  const shiftToUserMap = useMemo(() => {
    const reverse = {};
    Object.entries(userShiftMap).forEach(([userId, shiftId]) => {
      if (shiftId) {
        reverse[String(shiftId)] = String(userId);
      }
    });
    return reverse;
  }, [userShiftMap]);

  const userNameById = useMemo(() => {
    const lookup = {};
    users.forEach(user => {
      lookup[String(user.id)] = user.name;
    });
    return lookup;
  }, [users]);

  const formatShiftOption = shift =>
    `${shift.day} ${shift.start_time}-${shift.end_time} (#${shift.id})`;

  const mapShiftToUser = (userId, shiftId) => {
    const userIdStr = String(userId);
    const shiftIdStr = String(shiftId);

    setUserShiftMap(prev => {
      const next = { ...prev };

      if (!shiftIdStr) {
        delete next[userIdStr];
        return next;
      }

      Object.keys(next).forEach(existingUserId => {
        if (next[existingUserId] === shiftIdStr) {
          delete next[existingUserId];
        }
      });

      next[userIdStr] = shiftIdStr;
      return next;
    });
  };

  const openUserModal = () => {
    setUserForm({ ...EMPTY_USER_FORM, role: roleOptions[0] || 'Cook' });
    setUserFormError('');
    setShowUserModal(true);
  };

  const closeUserModal = () => setShowUserModal(false);

  const handleUserFormChange = e => {
    setUserForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitUserForm = async () => {
    if (!userForm.name.trim()) { setUserFormError('Name is required.'); return; }
    if (!userForm.email.trim()) { setUserFormError('Email is required.'); return; }
    if (!userForm.phone.trim()) { setUserFormError('Phone is required.'); return; }
    if (!userForm.role.trim()) { setUserFormError('Role is required.'); return; }

    try {
      setUserFormError('');
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          phone: userForm.phone.trim(),
          role: userForm.role.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add user.');
      }

      await fetchUsers();
      closeUserModal();
    } catch (error) {
      setUserFormError(error.message || 'Failed to add user.');
    }
  };

  const openShiftModal = () => {
    setShiftForm({ ...EMPTY_SHIFT_FORM, role: roleOptions[0] || 'Cook' });
    setShiftFormError('');
    setShowShiftModal(true);
  };

  const closeShiftModal = () => setShowShiftModal(false);

  const handleShiftFormChange = e => {
    setShiftForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitShiftForm = async () => {
    if (!shiftForm.role.trim()) { setShiftFormError('Role is required.'); return; }
    if (!shiftForm.userId) { setShiftFormError('User is required.'); return; }
    if (!shiftForm.day.trim()) { setShiftFormError('Day is required.'); return; }
    if (!shiftForm.startTime.trim()) { setShiftFormError('Start time is required.'); return; }
    if (!shiftForm.endTime.trim()) { setShiftFormError('End time is required.'); return; }

    try {
      setShiftFormError('');
      const response = await fetch(`${API_BASE_URL}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: Number(shiftForm.userId),
          day: shiftForm.day.trim(),
          start_time: shiftForm.startTime.trim(),
          end_time: shiftForm.endTime.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to add shift.');
      }

      await fetchShifts();
      closeShiftModal();
    } catch (error) {
      setShiftFormError(error.message || 'Failed to add shift.');
    }
  };

  const shiftRoleUsers = useMemo(
    () => users.filter(user => user.role === shiftForm.role),
    [users, shiftForm.role]
  );

  return (
    <div className="app">
      <h1>Restaurant Staff Scheduling</h1>

      {globalError && (
        <div className="error-banner">
          <p>{globalError}</p>
          <button onClick={loadInitialData}>Retry</button>
        </div>
      )}

      <div className="toolbar">
        <button onClick={openUserModal}>+ Add User</button>
        <button onClick={openShiftModal}>+ Add Shift</button>
      </div>

      {isLoading && <p className="empty">Loading data...</p>}

      <div className="mapping-grid">
        <section className="mapping-panel">
          <h2>Users</h2>
          {users.length === 0 && <p className="empty">No users yet. Add one above.</p>}
          {users.map(user => (
            <div key={user.id} className="mapping-row">
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-meta">{user.role} • {user.email || 'No email'} • {user.phone || 'No phone'} • #{user.id}</span>
              </div>
              <select
                className="mapping-select"
                value={userShiftMap[String(user.id)] || ''}
                onChange={event => mapShiftToUser(user.id, event.target.value)}
              >
                <option value="">Unassigned</option>
                {shifts.map(shift => (
                  <option key={shift.id} value={shift.id}>
                    {formatShiftOption(shift)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </section>

        <section className="mapping-panel">
          <h2>Shifts</h2>
          {shifts.length === 0 && <p className="empty">No shifts yet. Add one above.</p>}
          {shifts.map(shift => {
            const mappedUserId = shiftToUserMap[String(shift.id)];
            return (
              <div key={shift.id} className="mapping-row shift-row">
                <div className="user-info">
                  <span className="user-name">{shift.day}</span>
                  <span className="user-meta">{shift.start_time} - {shift.end_time} • #{shift.id}</span>
                </div>
                <span className="mapped-pill">
                  {mappedUserId ? `Assigned to ${userNameById[mappedUserId] || `User #${mappedUserId}`}` : 'Unassigned to a user'}
                </span>
              </div>
            );
          })}
        </section>
      </div>

      {showUserModal && (
        <div className="modal-overlay" onClick={closeUserModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add User</h2>
            <div className="modal-body">
              <label>
                Name <span className="required">*</span>
                <input
                  name="name"
                  placeholder="e.g. Jane Smith"
                  value={userForm.name}
                  onChange={handleUserFormChange}
                  autoFocus
                />
              </label>
              <label>
                Email <span className="required">*</span>
                <input
                  name="email"
                  type="email"
                  placeholder="e.g. jane@example.com"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                />
              </label>
              <label>
                Phone <span className="required">*</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="e.g. 555-0100"
                  value={userForm.phone}
                  onChange={handleUserFormChange}
                />
              </label>
              <label>
                Role <span className="required">*</span>
                <select name="role" value={userForm.role} onChange={handleUserFormChange}>
                  {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>
              {userFormError && <p className="form-error">{userFormError}</p>}
            </div>
            <div className="modal-actions">
              <button className="cancel" onClick={closeUserModal}>Cancel</button>
              <button onClick={submitUserForm}>Add User</button>
            </div>
          </div>
        </div>
      )}

      {showShiftModal && (
        <div className="modal-overlay" onClick={closeShiftModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Shift</h2>
            <div className="modal-body">
              <label>
                Role <span className="required">*</span>
                <select
                  name="role"
                  value={shiftForm.role}
                  onChange={event => {
                    const nextRole = event.target.value;
                    setShiftForm(prev => ({ ...prev, role: nextRole, userId: '' }));
                  }}
                  autoFocus
                >
                  {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>
              <label>
                User <span className="required">*</span>
                <select
                  name="userId"
                  value={shiftForm.userId}
                  onChange={handleShiftFormChange}
                >
                  <option value="">{shiftRoleUsers.length ? 'Select a user' : 'No users for selected role'}</option>
                  {shiftRoleUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name} (#{user.id})</option>
                  ))}
                </select>
              </label>
              <label>
                Day <span className="required">*</span>
                <input
                  name="day"
                  type="date"
                  value={shiftForm.day}
                  onChange={handleShiftFormChange}
                />
              </label>
              <label>
                Start Time <span className="required">*</span>
                <input
                  name="startTime"
                  type="time"
                  value={shiftForm.startTime}
                  onChange={handleShiftFormChange}
                />
              </label>
              <label>
                End Time <span className="required">*</span>
                <input
                  name="endTime"
                  type="time"
                  value={shiftForm.endTime}
                  onChange={handleShiftFormChange}
                />
              </label>
              {shiftFormError && <p className="form-error">{shiftFormError}</p>}
            </div>
            <div className="modal-actions">
              <button className="cancel" onClick={closeShiftModal}>Cancel</button>
              <button onClick={submitShiftForm}>Add Shift</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
