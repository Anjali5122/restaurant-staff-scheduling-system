
const formatShiftOption = shift =>
  `${shift.day} ${shift.start_time}-${shift.end_time} (#${shift.id})`;

export const getShiftRole = (shift, userRoleById) =>
  shift.role || userRoleById[String(shift.user_id)] || '';

function UsersSection({ users, shifts, userShiftMap, userRoleById, onToggleShiftAssignment, assignmentErrors }) {
  return (
    <section className="mapping-panel">
      <h2>Users</h2>
      {users.length === 0 && <p className="empty">No users yet. Add one above.</p>}
      {users.map(user => {
        const assignedShiftIds = userShiftMap[String(user.id)] || [];
        const assignedShifts = shifts.filter(shift => assignedShiftIds.includes(String(shift.id)));
        const roleShifts = shifts.filter(shift => getShiftRole(shift, userRoleById) === user.role);

        return (
          <div key={user.id} className="user-card">
            <div className="user-card-header">
              <span className="user-name">{user.name}</span>
              <span className="user-position">{user.role}</span>
            </div>

            <div className="user-meta-row">
              <span className="user-meta">{user.email || 'No email'}</span>
              <span className="user-meta">{user.phone || 'No phone'}</span>
              <span className="user-meta">#{user.id}</span>
            </div>

            <div className="user-card-section">
              <span className="user-card-label">Assigned shifts</span>
              <div className="assigned-shifts">
                {assignedShifts.length === 0 ? (
                  <span className="user-meta">No shifts assigned</span>
                ) : (
                  assignedShifts.map(shift => (
                    <span key={shift.id} className="assigned-shift-pill">
                      {formatShiftOption(shift)}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="user-card-section">
              <span className="user-card-label">Assign to a shift</span>
              <div className="shift-checkbox-list">
                {roleShifts.length === 0 && <span className="user-meta">No shifts for role</span>}
                {roleShifts.map(shift => {
                  const shiftId = String(shift.id);
                  return (
                    <label key={shift.id} className="shift-checkbox-option">
                      <input
                        type="checkbox"
                        checked={assignedShiftIds.includes(shiftId)}
                        onChange={event => onToggleShiftAssignment(user.id, shift.id, event.target.checked)}
                      />
                      {formatShiftOption(shift)}
                    </label>
                  );
                })}
              </div>
              {assignmentErrors && assignmentErrors[String(user.id)] && (
                <p className="form-error">{assignmentErrors[String(user.id)]}</p>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default UsersSection;
