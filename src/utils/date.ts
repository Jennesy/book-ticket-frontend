// Local midnight of today, for date-only comparisons and date picker `min`
export const startOfToday = (): Date => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

// Concert times are Taiwan times; display them in Asia/Taipei whatever the browser's timezone
const TAIPEI_TIME_ZONE = 'Asia/Taipei'

const taipeiParts = (isoString: string, options: Intl.DateTimeFormatOptions) => {
  const parts = new Intl.DateTimeFormat('zh-TW', { timeZone: TAIPEI_TIME_ZONE, hourCycle: 'h23', ...options })
    .formatToParts(new Date(isoString))
  return Object.fromEntries(parts.map(part => [part.type, part.value]))
}

// e.g. 9/20 (六) 12:00
export const formatTaipeiShort = (isoString: string): string => {
  const { month, day, weekday, hour, minute } = taipeiParts(isoString, {
    month: 'numeric', day: 'numeric', weekday: 'narrow', hour: '2-digit', minute: '2-digit'
  })
  return `${month}/${day} (${weekday}) ${hour}:${minute}`
}
