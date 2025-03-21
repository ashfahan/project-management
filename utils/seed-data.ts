import { v4 as uuidv4 } from "uuid"
import type { Project, Task, TeamMember } from "@/types/project"
import { TASK_PRIORITIES, TASK_STATUSES, PROJECT_STATUSES } from "@/constants/app-constants"

/**
 * Generate a random date within a range
 */
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

/**
 * Generate a random item from an array
 */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Generate a random number between min and max (inclusive)
 */
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate seed team members
 */
export function generateSeedTeamMembers(): TeamMember[] {
  const members = [
    {
      id: uuidv4(),
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: uuidv4(),
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: uuidv4(),
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: uuidv4(),
      name: "Sarah Williams",
      email: "sarah@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: uuidv4(),
      name: "Michael Brown",
      email: "michael@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]
  return members
}

/**
 * Generate seed tasks for a project
 */
export function generateSeedTasks(teamMembers: TeamMember[], count = 8): Task[] {
  const statuses = Object.values(TASK_STATUSES)
  const priorities = Object.values(TASK_PRIORITIES)
  const tasks: Task[] = []

  const today = new Date()
  const oneMonthAhead = new Date()
  oneMonthAhead.setMonth(today.getMonth() + 1)

  const taskTitles = [
    "Design user interface",
    "Implement authentication",
    "Create database schema",
    "Write API documentation",
    "Set up CI/CD pipeline",
    "Perform security audit",
    "Optimize performance",
    "Fix reported bugs",
    "Add new feature",
    "Update dependencies",
    "Write unit tests",
    "Conduct user testing",
  ]

  // Group tasks by status to assign positions
  const tasksByStatus: Record<string, Task[]> = {}

  for (let i = 0; i < count; i++) {
    const randomStatus = randomItem(statuses)
    const randomPriority = randomItem(priorities)
    const randomAssignee = Math.random() > 0.2 ? randomItem(teamMembers) : undefined
    const hasDueDate = Math.random() > 0.2

    const task: Task = {
      id: uuidv4(),
      title: randomItem(taskTitles),
      description: "This is a sample task description generated for testing purposes.",
      status: randomStatus,
      priority: randomPriority,
      dueDate: hasDueDate ? randomDate(today, oneMonthAhead).toISOString() : undefined,
      assignee: randomAssignee,
      createdAt: new Date().toISOString(),
    }

    // Initialize the status group if it doesn't exist
    if (!tasksByStatus[randomStatus]) {
      tasksByStatus[randomStatus] = []
    }

    // Add the task to its status group
    tasksByStatus[randomStatus].push(task)
  }

  // Assign positions within each status group
  Object.keys(tasksByStatus).forEach((status) => {
    tasksByStatus[status].forEach((task, index) => {
      task.position = index
    })

    // Add tasks from this status group to the final tasks array
    tasks.push(...tasksByStatus[status])
  })

  return tasks
}

/**
 * Generate seed projects
 */
export function generateSeedProjects(teamMembers: TeamMember[]): Project[] {
  const projectNames = [
    "Website Redesign",
    "Mobile App Development",
    "Database Migration",
    "API Integration",
    "Marketing Campaign",
  ]

  const projectDescriptions = [
    "Redesign the company website to improve user experience and conversion rates.",
    "Develop a cross-platform mobile application for our customers.",
    "Migrate the existing database to a more scalable solution.",
    "Integrate our system with third-party APIs for enhanced functionality.",
    "Plan and execute a marketing campaign for the new product launch.",
  ]

  const projects = projectNames.map((name, index) => {
    // Assign 2-4 random team members to each project
    const projectTeamSize = randomNumber(2, 4)
    const shuffledTeam = [...teamMembers].sort(() => 0.5 - Math.random())
    const projectTeam = shuffledTeam.slice(0, projectTeamSize)

    return {
      id: uuidv4(),
      name,
      description: projectDescriptions[index],
      status: PROJECT_STATUSES.ACTIVE,
      teamMembers: projectTeam,
      tasks: generateSeedTasks(projectTeam),
      createdAt: new Date().toISOString(),
    }
  })

  return projects
}

/**
 * Generate complete seed data
 */
export function generateSeedData() {
  const teamMembers = generateSeedTeamMembers()
  const projects = generateSeedProjects(teamMembers)

  return { teamMembers, projects }
}

