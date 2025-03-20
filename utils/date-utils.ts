import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns"

/**
 * Format a date to a readable string
 */
export function formatDueDate(date: Date): string {
  if (isToday(date)) {
    return "Today"
  } else if (isTomorrow(date)) {
    return "Tomorrow"
  } else {
    return format(date, "MMM d")
  }
}

/**
 * Get the appropriate color class for a deadline based on its proximity
 */
export function getDeadlineColor(date: Date): string {
  if (isPast(date) && !isToday(date)) {
    return "text-destructive font-medium"
  } else if (isToday(date)) {
    return "text-warning font-medium"
  } else {
    return "text-muted-foreground"
  }
}

/**
 * Check if a deadline is approaching soon (within 3 days)
 */
export function isDeadlineSoon(date: Date): boolean {
  const now = new Date()
  const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffInDays <= 3 && diffInDays >= 0
}

/**
 * Format a date as a relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}

