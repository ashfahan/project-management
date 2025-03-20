export const TASK_STATUSES = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  REVIEW: "review",
  DONE: "done",
}

export const TASK_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
}

export const PROJECT_STATUSES = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  PLANNING: "Planning",
}

export const COLUMNS = [
  { id: TASK_STATUSES.TODO, title: "To Do" },
  { id: TASK_STATUSES.IN_PROGRESS, title: "In Progress" },
  { id: TASK_STATUSES.REVIEW, title: "Review" },
  { id: TASK_STATUSES.DONE, title: "Done" },
]

export const LOCAL_STORAGE_KEYS = {
  PROJECTS: "projects",
  TEAM_MEMBERS: "teamMembers",
  THEME: "theme",
}

