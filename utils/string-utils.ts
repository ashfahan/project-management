/**
 * Get initials from a name (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Get the appropriate variant for a status
 */
export function getStatusVariant(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "default"
    case "completed":
      return "success"
    case "on hold":
      return "warning"
    default:
      return "secondary"
  }
}

/**
 * Get the appropriate variant for a priority
 */
export function getPriorityVariant(priority: string): string {
  switch (priority.toLowerCase()) {
    case "high":
      return "destructive"
    case "medium":
      return "warning"
    case "low":
      return "secondary"
    default:
      return "outline"
  }
}

