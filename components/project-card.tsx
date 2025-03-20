"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/types/project"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { getStatusVariant } from "@/utils/string-utils"
import { getInitials } from "@/utils/string-utils"
import { isDeadlineSoon, formatRelativeTime } from "@/utils/date-utils"
import { calculateProjectProgress, getNextDeadline } from "@/utils/task-utils"

interface ProjectCardProps {
  project: Project
  onClick: () => void
  isActive: boolean
}

export default function ProjectCard({ project, onClick, isActive }: ProjectCardProps) {
  const completedTasks = project.tasks.filter((task) => task.status === "done").length
  const totalTasks = project.tasks.length
  const progress = calculateProjectProgress(project)
  const nextDeadline = getNextDeadline(project.tasks)

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isActive ? "ring-2 ring-primary" : ""}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{project.name}</CardTitle>
          <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>
              {completedTasks} of {totalTasks} tasks
            </span>
          </div>
          <Progress value={progress} className="h-2" aria-label={`Project progress: ${Math.round(progress)}%`} />
        </div>

        {nextDeadline && (
          <div className="text-sm">
            <span className="text-muted-foreground">Next deadline: </span>
            <span className={`font-medium ${isDeadlineSoon(nextDeadline) ? "text-destructive" : ""}`}>
              {formatRelativeTime(nextDeadline)}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex -space-x-2" aria-label={`${project.teamMembers.length} team members assigned`}>
          {project.teamMembers.slice(0, 3).map((member, index) => (
            <Avatar key={index} className="border-2 border-background h-8 w-8">
              <AvatarImage src={member.avatar} alt={`Team member ${member.name}`} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
          ))}
          {project.teamMembers.length > 3 && (
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
              +{project.teamMembers.length - 3}
              <span className="sr-only">additional team members</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

