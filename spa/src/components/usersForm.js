function UsersForm({
  showUserModal,
  closeUserModal,
  userForm,
  handleUserFormChange,
  roleOptions,
  userFormError,
  submitUserForm,
}) {
  if (!showUserModal) {
    return null;
  }

  return (
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
  );
}

export default UsersForm;