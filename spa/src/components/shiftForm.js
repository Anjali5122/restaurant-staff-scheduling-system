function ShiftForm({
  showShiftModal,
  closeShiftModal,
  shiftForm,
  setShiftForm,
  handleShiftFormChange,
  roleOptions,
  shiftRoleUsers,
  shiftFormError,
  submitShiftForm,
}) {
  if (!showShiftModal) {
    return null;
  }

  return (
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
  );
}

export default ShiftForm;