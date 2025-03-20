"use client"

import type React from "react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon } from "lucide-react"
import type { Task } from "@/types/project"
import { formatDueDate, getDeadlineColor } from "@/utils/date-utils"
import { getPriorityVariant } from "@/utils/string-utils"
import { getInitials } from "@/utils/string-utils"

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClick()
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all"
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      role="button"
      aria-label={`Edit task: ${task.title}`}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-medium line-clamp-2">{task.title}</h4>
          <Badge variant={getPriorityVariant(task.priority)}>
            {task.priority}
            <span className="sr-only">Priority: {task.priority}</span>
          </Badge>
        </div>
        {task.description && <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>}
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        {task.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatar} alt={`Assigned to ${task.assignee.name}`} />
            <AvatarFallback>{getInitials(task.assignee.name)}</AvatarFallback>
          </Avatar>
        )}

        {dueDate && (
          <div className={`flex items-center text-xs gap-1 ${getDeadlineColor(dueDate)}`}>
            <CalendarIcon className="h-3 w-3" />
            <span>{formatDueDate(dueDate)}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

