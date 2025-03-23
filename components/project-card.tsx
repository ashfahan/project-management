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

// Maximum number of team members to display avatars for
const MAX_VISIBLE_MEMBERS = 3

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

  const cardClassName = `cursor-pointer transition-all hover:shadow-md ${isActive ? "ring-2 ring-primary" : ""}`
  const deadlineClassName = nextDeadline && isDeadlineSoon(nextDeadline) ? "text-destructive" : ""

  return (
    <Card className={cardClassName} onClick={onClick}>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base sm:text-lg">{project.name}</CardTitle>
          <Badge variant={getStatusVariant(project.status)} className="text-xs">
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 sm:p-6 pt-0 sm:pt-0">
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{project.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Progress</span>
            <span>
              {completedTasks} of {totalTasks} tasks
            </span>
          </div>
          <Progress
            value={progress}
            className="h-1.5 sm:h-2"
            aria-label={`Project progress: ${Math.round(progress)}%`}
          />
        </div>

        {nextDeadline && (
          <div className="text-xs sm:text-sm">
            <span className="text-muted-foreground">Next deadline: </span>
            <span className={`font-medium ${deadlineClassName}`}>{formatRelativeTime(nextDeadline)}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="flex -space-x-2" aria-label={`${project.teamMembers.length} team members assigned`}>
          {project.teamMembers.slice(0, MAX_VISIBLE_MEMBERS).map((member, index) => (
            <Avatar key={index} className="border-2 border-background h-6 w-6 sm:h-8 sm:w-8">
              <AvatarImage src={member.avatar} alt={`Team member ${member.name}`} />
              <AvatarFallback className="text-xs sm:text-sm">{getInitials(member.name)}</AvatarFallback>
            </Avatar>
          ))}
          {project.teamMembers.length > MAX_VISIBLE_MEMBERS && (
            <div className="flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-muted text-xs font-medium">
              +{project.teamMembers.length - MAX_VISIBLE_MEMBERS}
              <span className="sr-only">additional team members</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

