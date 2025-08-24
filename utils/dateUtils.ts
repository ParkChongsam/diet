
export const getTodayDateString = (): string => {
  const today = new Date();
  // Use ISO string and take the date part to avoid timezone issues
  return today.toISOString().split('T')[0];
};
