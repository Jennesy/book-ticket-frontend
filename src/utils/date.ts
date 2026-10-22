// Local midnight of today, for date-only comparisons and date picker `min`
export const startOfToday = (): Date => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

// Concert times are Taiwan times; display and edit them in Asia/Taipei whatever the browser's timezone
const TAIPEI_TIME_ZONE = 'Asia/Taipei'
const TAIPEI_OFFSET = '+08:00'

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

// UTC ISO string → value for <input type="datetime-local">, e.g. 2025-09-20T12:00
export const toTaipeiInputValue = (isoString: string): string => {
  const { year, month, day, hour, minute } = taipeiParts(isoString, {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  })
  return `${year}-${month}-${day}T${hour}:${minute}`
}

// <input type="datetime-local"> value → ISO string with the Taiwan offset, e.g. 2025-09-20T12:00:00+08:00
export const fromTaipeiInputValue = (value: string): string => `${value}:00${TAIPEI_OFFSET}`

// UTC ISO string → value for <input type="date">, e.g. 2025-09-24
export const toTaipeiDateInputValue = (isoString: string): string =>
  toTaipeiInputValue(isoString).slice(0, 10)

// <input type="date"> value → the last moment of that day in Taiwan, e.g. 2025-09-24T23:59:59.999+08:00
export const endOfTaipeiDay = (value: string): string => `${value}T23:59:59.999${TAIPEI_OFFSET}`
