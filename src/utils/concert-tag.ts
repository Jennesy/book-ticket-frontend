const DATE_TAG_PATTERN = /^(\d{4})(\d{2})(\d{2})$/

// Built from local date parts: toISOString() is UTC and would shift the day in UTC+8
export const dateToTag = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

// Tags not in YYYYMMDD form (e.g. created via the API directly) are shown as is
export const formatTag = (tag: string): string => {
  const match = tag.match(DATE_TAG_PATTERN)
  return match ? `${match[1]}/${match[2]}/${match[3]}` : tag
}
