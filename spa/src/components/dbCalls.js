export const fetchUsersData = async (apiBaseUrl, setUsers) => {
  const response = await fetch(`${apiBaseUrl}/users`);
  if (!response.ok) {
    throw new Error('Failed to load users.');
  }
  const data = await response.json();
  setUsers(data);
  return data;
};

export const fetchShiftsData = async (apiBaseUrl, setShifts) => {
  const response = await fetch(`${apiBaseUrl}/shifts`);
  if (!response.ok) {
    throw new Error('Failed to load shifts.');
  }
  const data = await response.json();
  setShifts(data);
  return data;
};