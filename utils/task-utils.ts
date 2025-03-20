import type { Project, Task } from "@/types/project"

/**
 * Calculate the progress of a project based on completed tasks
 */
export function calculateProjectProgress(project: Project): number {
  const completedTasks = project.tasks.filter((task) => task.status === "done").length
  const totalTasks = project.tasks.length
  return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
}

/**
 * Get the next upcoming deadline from a list of tasks
 */
export function getNextDeadline(tasks: Task[]): Date | null {
  const incompleteTasks = tasks.filter((task) => task.status !== "done")
  const upcomingDeadlines = incompleteTasks
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  return upcomingDeadlines.length > 0 ? new Date(upcomingDeadlines[0].dueDate!) : null
}

/**
 * Filter tasks by status
 */
export function getTasksByStatus(tasks: Task[], status: string): Task[] {
  return tasks.filter((task) => task.status === status)
}

