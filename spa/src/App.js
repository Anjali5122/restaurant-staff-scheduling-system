import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import UsersSections, { getShiftRole } from './components/usersSections';
import ShiftsSection from './components/shiftsSection';
import UsersForm from './components/usersForm';
import ShiftForm from './components/shiftForm';
import { fetchUsersData, fetchShiftsData } from './components/dbCalls';

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
  const [assignmentErrors, setAssignmentErrors] = useState({});

  const roleOptions = ROLE_OPTIONS;

  const fetchUsers = useCallback(async () => {
    return fetchUsersData(API_BASE_URL, setUsers);
  }, []);

  const fetchShifts = useCallback(async () => {
    return fetchShiftsData(API_BASE_URL, setShifts);
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

    Object.entries(userShiftMap).forEach(([userId, shiftIds]) => {
      if (!validUserIds.has(userId)) return;
      const filteredShiftIds = (shiftIds || []).filter(shiftId => validShiftIds.has(String(shiftId)));
      if (filteredShiftIds.length > 0) {
        nextMap[userId] = filteredShiftIds;
      }
    });

    const changed = JSON.stringify(nextMap) !== JSON.stringify(userShiftMap);
    if (changed) {
      setUserShiftMap(nextMap);
    }
  }, [users, shifts, userShiftMap]);

  const shiftToUserMap = useMemo(() => {
    const reverse = {};
    Object.entries(userShiftMap).forEach(([userId, shiftIds]) => {
      (shiftIds || []).forEach(shiftId => {
        reverse[String(shiftId)] = String(userId);
      });
    });
    return reverse;
  }, [userShiftMap]);

  const shiftsById = useMemo(() => {
    const lookup = {};
    shifts.forEach(shift => {
      lookup[String(shift.id)] = shift;
    });
    return lookup;
  }, [shifts]);

  const userNameById = useMemo(() => {
    const lookup = {};
    users.forEach(user => {
      lookup[String(user.id)] = user.name;
    });
    return lookup;
  }, [users]);

  const userRoleById = useMemo(() => {
    const lookup = {};
    users.forEach(user => {
      lookup[String(user.id)] = user.role;
    });
    return lookup;
  }, [users]);

  const clearAssignmentError = userIdStr => {
    setAssignmentErrors(prev => {
      if (!prev[userIdStr]) return prev;
      const next = { ...prev };
      delete next[userIdStr];
      return next;
    });
  };

  const assignShiftToUser = (userId, shiftId) => {
    const userIdStr = String(userId);
    const shiftIdStr = String(shiftId);

    setUserShiftMap(prev => {
      const next = {};
      Object.entries(prev).forEach(([existingUserId, shiftIds]) => {
        next[existingUserId] = existingUserId === userIdStr
          ? [...shiftIds]
          : shiftIds.filter(id => id !== shiftIdStr);
      });

      const currentForUser = next[userIdStr] || [];
      if (!currentForUser.includes(shiftIdStr)) {
        next[userIdStr] = [...currentForUser, shiftIdStr];
      }
      return next;
    });
  };

  const toggleShiftAssignment = (userId, shiftId, isChecked) => {
    const userIdStr = String(userId);
    const shiftIdStr = String(shiftId);

    if (!isChecked) {
      setUserShiftMap(prev => ({
        ...prev,
        [userIdStr]: (prev[userIdStr] || []).filter(id => id !== shiftIdStr),
      }));
      clearAssignmentError(userIdStr);
      return;
    }

    const targetShift = shiftsById[shiftIdStr];
    if (!targetShift) return;

    const existingForUser = userShiftMap[userIdStr] || [];
    const conflictingShift = existingForUser
      .map(id => shiftsById[id])
      .find(shift => shift && shift.day === targetShift.day);

    if (conflictingShift) {
      setAssignmentErrors(prev => ({
        ...prev,
        [userIdStr]: `Already assigned to a shift on ${targetShift.day} (#${conflictingShift.id}). Shifts must be on different days.`,
      }));
      return;
    }

    clearAssignmentError(userIdStr);
    assignShiftToUser(userId, shiftId);
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
          role: shiftForm.role.trim(),
          day: shiftForm.day.trim(),
          start_time: shiftForm.startTime.trim(),
          end_time: shiftForm.endTime.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to add shift.');
      }

      const createdShift = await response.json();
      const refreshedShifts = await fetchShifts();
      if (refreshedShifts.some(shift => String(shift.id) === String(createdShift.id))) {
        assignShiftToUser(createdShift.user_id, createdShift.id);
      }
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
        <UsersSections
          users={users}
          shifts={shifts}
          userShiftMap={userShiftMap}
          userRoleById={userRoleById}
          onToggleShiftAssignment={toggleShiftAssignment}
          assignmentErrors={assignmentErrors}
        />
        <ShiftsSection
          shifts={shifts}
          shiftToUserMap={shiftToUserMap}
          userNameById={userNameById}
          userRoleById={userRoleById}
          getShiftRole={getShiftRole}
        />
      </div>

      <UsersForm
        showUserModal={showUserModal}
        closeUserModal={closeUserModal}
        userForm={userForm}
        handleUserFormChange={handleUserFormChange}
        roleOptions={roleOptions}
        userFormError={userFormError}
        submitUserForm={submitUserForm}
      />

      <ShiftForm
        showShiftModal={showShiftModal}
        closeShiftModal={closeShiftModal}
        shiftForm={shiftForm}
        setShiftForm={setShiftForm}
        handleShiftFormChange={handleShiftFormChange}
        roleOptions={roleOptions}
        shiftRoleUsers={shiftRoleUsers}
        shiftFormError={shiftFormError}
        submitShiftForm={submitShiftForm}
      />
    </div>
  );
}

export default App;
