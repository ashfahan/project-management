export interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  assignee?: TeamMember
  position?: number // Added position field for ordering within columns
  createdAt: string
  updatedAt?: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: string
  teamMembers: TeamMember[]
  tasks: Task[]
  createdAt: string
  updatedAt?: string
}

