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
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TaskCardProps {
  task: Task
  onClick: () => void
  isDragging?: boolean
}

export default function TaskCard({ task, onClick, isDragging = false }: TaskCardProps) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null

  // Add sortable functionality directly to the TaskCard
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  })

  // Use either the passed isDragging prop or the sortable isDragging state
  const isCurrentlyDragging = isDragging || isSortableDragging

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isCurrentlyDragging ? 0.5 : 1,
    zIndex: isCurrentlyDragging ? 999 : "auto",
  }

  const handleClick = (e: React.MouseEvent) => {
    // Prevent opening the dialog if we're dragging
    if (isCurrentlyDragging) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    e.preventDefault()
    e.stopPropagation()
    onClick()
  }

  const cardClassName = `cursor-grab hover:shadow-md transition-all min-h-[140px] sm:min-h-[160px] ${
    isCurrentlyDragging
      ? "shadow-lg border-2 border-primary cursor-grabbing"
      : "border border-border hover:border-primary/30"
  }`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative transition-all mb-3 last:mb-0 select-none touch-none min-h-[140px] sm:min-h-[160px] ${
        isCurrentlyDragging ? "z-50 opacity-50" : ""
      }`}
      data-task-id={task.id}
      {...attributes}
      {...listeners}
    >
      <Card
        className={cardClassName}
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
        <CardContent className="p-3 space-y-2 overflow-hidden">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-medium line-clamp-2">{task.title}</h4>
            <Badge variant={getPriorityVariant(task.priority)}>
              {task.priority}
              <span className="sr-only">Priority: {task.priority}</span>
            </Badge>
          </div>
          {task.description && <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>}
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between items-center absolute bottom-0 left-0 right-0">
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
    </div>
  )
}

