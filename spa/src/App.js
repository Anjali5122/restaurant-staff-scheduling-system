import { useState } from 'react';
import './App.css';

const POSITIONS = ['Cook', 'Server', 'Manager'];
const EMPTY_USER_FORM = { name: '', email: '', phone: '', position: POSITIONS[0] };
const EMPTY_SHIFT_FORM = { date: '', startTime: '', endTime: '', position: POSITIONS[0] };

const formatShiftLabel = ({ date, startTime, endTime, position }) =>
  `${date ? date + '  : ' : ''}${startTime} – ${endTime}`;

const DEFAULT_SHIFTS = [
  { id: 1, startTime: '6:00 AM', endTime: '2:00 PM', position: 'Cook' },
  { id: 2, startTime: '2:00 PM', endTime: '10:00 PM', position: 'Server' },
  { id: 3, startTime: '10:00 PM', endTime: '6:00 AM', position: 'Manager' },
];

function App() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice', email: 'alice@example.com', phone: '555-0101', position: 'Server', shiftId: 2 },
    { id: 2, name: 'Bob', email: 'bob@example.com', phone: '555-0102', position: 'Cook', shiftId: 1 },
  ]);
  const [shifts, setShifts] = useState(DEFAULT_SHIFTS);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);
  const [userFormError, setUserFormError] = useState('');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftForm, setShiftForm] = useState(EMPTY_SHIFT_FORM);
  const [shiftFormError, setShiftFormError] = useState('');

  const openUserModal = () => {
    setUserForm(EMPTY_USER_FORM);
    setUserFormError('');
    setShowUserModal(true);
  };

  const closeUserModal = () => setShowUserModal(false);

  const handleUserFormChange = e => {
    setUserForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitUserForm = () => {
    if (!userForm.name.trim()) { setUserFormError('Name is required.'); return; }
    if (!userForm.email.trim()) { setUserFormError('Email is required.'); return; }
    setUsers(prev => [
      ...prev,
      { id: Date.now(), ...userForm, name: userForm.name.trim(), email: userForm.email.trim(), phone: userForm.phone.trim(), shiftId: shifts[0]?.id ?? null },
    ]);
    closeUserModal();
  };

  const openShiftModal = () => {
    setShiftForm(EMPTY_SHIFT_FORM);
    setShiftFormError('');
    setShowShiftModal(true);
  };

  const closeShiftModal = () => setShowShiftModal(false);

  const handleShiftFormChange = e => {
    setShiftForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitShiftForm = () => {
    if (!shiftForm.date) { setShiftFormError('Date is required.'); return; }
    if (!shiftForm.startTime) { setShiftFormError('Start time is required.'); return; }
    if (!shiftForm.endTime) { setShiftFormError('End time is required.'); return; }
    setShifts(prev => [...prev, { id: Date.now(), ...shiftForm }]);
    closeShiftModal();
  };

  const updateShift = (userId, shiftId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, shiftId: shiftId === '' ? null : Number(shiftId) } : u));
  };

  return (
    <div className="app">
      <h1>Restaurant Staff Scheduling</h1>

      <div className="toolbar">
        <button onClick={openUserModal}>+ Add User</button>
        <button onClick={openShiftModal}>+ Add Shift</button>
      </div>

      <div className="user-list">
        <div className="user-list-header">
          <span>Name</span>
          <span>Position</span>
          <span>Assigned Shift</span>
        </div>
        {users.length === 0 && <p className="empty">No users yet. Add one above.</p>}
        {users.map(user => (
          <div key={user.id} className="user-row">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-meta">{user.email}{user.phone ? ` · ${user.phone}` : ''}</span>
            </div>
            <span className="user-position">{user.position}</span>
            <select
              value={user.shiftId ?? ''}
              onChange={e => updateShift(user.id, e.target.value)}
            >
              {shifts.filter(s =>
                s.position === user.position &&
                (s.id === user.shiftId || !users.some(u => u.id !== user.id && u.shiftId === s.id))
              ).length === 0 && (
                <option value="">No shifts for {user.position}</option>
              )}
              {shifts.filter(s =>
                s.position === user.position &&
                (s.id === user.shiftId || !users.some(u => u.id !== user.id && u.shiftId === s.id))
              ).length > 0 && <option value="">— None —</option>}
              {shifts.filter(s =>
                s.position === user.position &&
                (s.id === user.shiftId || !users.some(u => u.id !== user.id && u.shiftId === s.id))
              ).map(shift => (
                <option key={shift.id} value={shift.id}>{formatShiftLabel(shift)}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {showUserModal && (
        <div className="modal-overlay" onClick={closeUserModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add User</h2>
            <div className="modal-body">
              <label>
                Username <span className="required">*</span>
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
                Phone Number
                <input
                  name="phone"
                  type="tel"
                  placeholder="e.g. 555-0100"
                  value={userForm.phone}
                  onChange={handleUserFormChange}
                />
              </label>
              <label>
                Position
                <select name="position" value={userForm.position} onChange={handleUserFormChange}>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
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
                Date <span className="required">*</span>
                <input
                  name="date"
                  type="date"
                  value={shiftForm.date}
                  onChange={handleShiftFormChange}
                  autoFocus
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
              <label>
                Position Needed
                <select name="position" value={shiftForm.position} onChange={handleShiftFormChange}>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
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
