
const formatShiftOption = shift =>
  `${shift.day} ${shift.start_time}-${shift.end_time} (#${shift.id})`;

export const getShiftRole = (shift, userRoleById) =>
  shift.role || userRoleById[String(shift.user_id)] || '';

function UsersSection({ users, shifts, userShiftMap, userRoleById, onMapShiftToUser }) {
  return (
    <section className="mapping-panel">
      <h2>Users</h2>
      {users.length === 0 && <p className="empty">No users yet. Add one above.</p>}
      {users.map(user => (
        <div key={user.id} className="mapping-row">
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-meta">{user.role}</span>
            <span className="user-meta">{user.email || 'No email'}</span>
            <span className="user-meta">{user.phone || 'No phone'}</span>
            <span className="user-meta">#{user.id}</span>
          </div>
          <select
            className="mapping-select"
            value={userShiftMap[String(user.id)] || ''}
            onChange={event => onMapShiftToUser(user.id, event.target.value)}
          >
            <option value="">Unassigned</option>
            {shifts
              .filter(shift => getShiftRole(shift, userRoleById) === user.role)
              .map(shift => (
                <option key={shift.id} value={shift.id}>
                  {formatShiftOption(shift)}
                </option>
              ))}
          </select>
        </div>
      ))}
    </section>
  );
}

export default UsersSection;