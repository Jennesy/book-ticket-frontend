// Local midnight of today, for date-only comparisons and date picker `min`
export const startOfToday = (): Date => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}
