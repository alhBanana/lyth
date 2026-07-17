const pad2 = (value: number) => String(value).padStart(2, '0')

/**
 * Returns today's local calendar date in YYYY-MM-DD format.
 *
 * This avoids UTC-based date drift when resolving Today's Page.
 */
export const getTodayLocalDateIdentifier = (): string => {
  const today = new Date()
  return `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`
}

/**
 * Converts a date identifier to the canonical persisted date object.
 *
 * @param dateIdentifier - Local date identifier in YYYY-MM-DD format.
 * @returns Date anchored to midnight UTC for stable storage.
 */
export const localDateIdentifierToDbDate = (dateIdentifier: string): Date => {
  return new Date(`${dateIdentifier}T00:00:00.000Z`)
}

/**
 * Converts a persisted Date value into a YYYY-MM-DD identifier.
 *
 * @param date - Persisted date value.
 * @returns Date identifier used by Page and Story helpers.
 */
export const dbDateToDateIdentifier = (date: Date): string => {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`
}

/**
 * Formats a YYYY-MM-DD identifier into a user-facing day label.
 *
 * @param dateIdentifier - Date identifier in YYYY-MM-DD format.
 * @returns Human-readable date label for UI headings.
 */
export const formatDateIdentifierFriendly = (dateIdentifier: string): string => {
  const [year, month, day] = dateIdentifier.split('-').map(Number)
  const localDate = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(localDate)
}

/**
 * Computes the page number for a Story-relative day.
 *
 * @param dateIdentifier - Candidate Page date identifier.
 * @param storyStartDateIdentifier - Story start date identifier.
 * @returns Page number starting from 1, or null when date is before Story start.
 */
export const getStoryPageNumber = (dateIdentifier: string, storyStartDateIdentifier: string): number | null => {
  const current = localDateIdentifierToDbDate(dateIdentifier).getTime()
  const start = localDateIdentifierToDbDate(storyStartDateIdentifier).getTime()

  if (current < start) {
    return null
  }

  const dayDiff = Math.floor((current - start) / 86400000)
  return dayDiff + 1
}
