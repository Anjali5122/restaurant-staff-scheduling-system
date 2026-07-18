function ShiftsSection({ shifts, shiftToUserMap, userNameById, userRoleById, getShiftRole }) {
  return (
    <section className="mapping-panel">
      <h2>Shifts</h2>
      {shifts.length === 0 && <p className="empty">No shifts yet. Add one above.</p>}
      {shifts.map(shift => {
        const mappedUserId = shiftToUserMap[String(shift.id)];
        const displayRole = getShiftRole(shift, userRoleById) || 'No role';
        return (
          <div key={shift.id} className="mapping-row shift-row">
            <div className="user-info">
              <span className="user-name">{shift.day}</span>
              <span className="user-meta">{shift.start_time} - {shift.end_time} • #{shift.id} • {displayRole}</span>
            </div>
            <span className="mapped-pill">
              {mappedUserId ? `Assigned to ${userNameById[mappedUserId] || `User #${mappedUserId}`}` : 'Unassigned to a user'}
            </span>
          </div>
        );
      })}
    </section>
  );
}

export default ShiftsSection;