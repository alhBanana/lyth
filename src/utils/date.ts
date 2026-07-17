const pad2 = (value: number) => String(value).padStart(2, '0')

export const getTodayLocalDateIdentifier = (): string => {
  const today = new Date()
  return `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`
}

export const localDateIdentifierToDbDate = (dateIdentifier: string): Date => {
  return new Date(`${dateIdentifier}T00:00:00.000Z`)
}

export const dbDateToDateIdentifier = (date: Date): string => {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`
}

export const formatDateIdentifierFriendly = (dateIdentifier: string): string => {
  const [year, month, day] = dateIdentifier.split('-').map(Number)
  const localDate = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(localDate)
}

export const getStoryPageNumber = (dateIdentifier: string, storyStartDateIdentifier: string): number | null => {
  const current = localDateIdentifierToDbDate(dateIdentifier).getTime()
  const start = localDateIdentifierToDbDate(storyStartDateIdentifier).getTime()

  if (current < start) {
    return null
  }

  const dayDiff = Math.floor((current - start) / 86400000)
  return dayDiff + 1
}
