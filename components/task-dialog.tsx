"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProjects } from "@/hooks/use-projects"
import { v4 as uuidv4 } from "uuid"
import type { Project, Task } from "@/types/project"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { TASK_STATUSES, TASK_PRIORITIES } from "@/constants/app-constants"
import { toast } from "sonner"
import { DeleteConfirmPopover } from "./delete-confirm-popover"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  task: Task | null
}

export default function TaskDialog({ open, onOpenChange, project, task }: TaskDialogProps) {
  const { updateProject } = useProjects()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState(TASK_STATUSES.TODO)
  const [priority, setPriority] = useState(TASK_PRIORITIES.MEDIUM)
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined)
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setStatus(task.status)
      setPriority(task.priority)
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setAssigneeId(task.assignee?.id)
    } else {
      resetForm()
    }
  }, [task])

  const validateForm = () => {
    const newErrors: { title?: string; dueDate?: string } = {}

    if (!title.trim()) {
      newErrors.title = "Task title is required"
    } else if (title.length < 3) {
      newErrors.title = "Task title must be at least 3 characters"
    }

    if (dueDate && dueDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      newErrors.dueDate = "Due date cannot be in the past"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    const assignee =
      assigneeId && assigneeId !== "unassigned"
        ? project.teamMembers.find((member) => member.id === assigneeId)
        : undefined

    try {
      if (task) {
        // Update existing task
        const updatedTask: Task = {
          ...task,
          title,
          description,
          status,
          priority,
          dueDate: dueDate?.toISOString(),
          assignee,
          updatedAt: new Date().toISOString(),
        }

        // If the status has changed, we need to update positions
        if (task.status !== status) {
          // Get all tasks in the new status column
          const tasksInNewStatus = project.tasks
            .filter((t) => t.status === status && t.id !== task.id)
            .sort((a, b) => {
              if (a.position !== undefined && b.position !== undefined) {
                return a.position - b.position
              }
              return 0
            })

          // Add the task at the end of the column
          updatedTask.position = tasksInNewStatus.length

          // Get all tasks in the old status column
          const tasksInOldStatus = project.tasks
            .filter((t) => t.status === task.status && t.id !== task.id)
            .sort((a, b) => {
              if (a.position !== undefined && b.position !== undefined) {
                return a.position - b.position
              }
              return 0
            })

          // Update positions for tasks in the old status column
          const updatedTasksInOldStatus = tasksInOldStatus.map((t, index) => ({
            ...t,
            position: index,
          }))

          // Combine all tasks
          const updatedTasks = [
            ...project.tasks.filter((t) => t.id !== task.id && t.status !== task.status && t.status !== status),
            ...updatedTasksInOldStatus,
            ...tasksInNewStatus,
            updatedTask,
          ]

          updateProject({
            ...project,
            tasks: updatedTasks,
          })
        } else {
          // If status hasn't changed, just update the task
          const updatedTasks = project.tasks.map((t) => (t.id === task.id ? updatedTask : t))
          updateProject({
            ...project,
            tasks: updatedTasks,
          })
        }

        toast.success("Task updated", {
          description: "The task has been updated successfully.",
        })
      } else {
        // Create new task
        // Get all tasks in the selected status column
        const tasksInStatus = project.tasks
          .filter((t) => t.status === status)
          .sort((a, b) => {
            if (a.position !== undefined && b.position !== undefined) {
              return a.position - b.position
            }
            return 0
          })

        // Create new task with position at the end of the column
        const newTask: Task = {
          id: uuidv4(),
          title,
          description,
          status,
          priority,
          position: tasksInStatus.length, // Always add at the end of the column
          dueDate: dueDate?.toISOString(),
          assignee,
          createdAt: new Date().toISOString(),
        }

        updateProject({
          ...project,
          tasks: [...project.tasks, newTask],
        })

        toast.success("Task created", {
          description: "The task has been created successfully.",
        })
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error saving task:", error)
      toast.error("Error", {
        description: "Failed to save the task. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = () => {
    if (!task) return
    setIsDeleting(true)

    try {
      // Store a deep copy of the task and project for potential undo
      const taskToDelete = JSON.parse(JSON.stringify(task)) as Task
      const originalTasks = JSON.parse(JSON.stringify(project.tasks)) as Task[]
      const originalProject = JSON.parse(JSON.stringify(project)) as Project

      // Get all tasks in the same status column (excluding the task to delete)
      const tasksInSameStatus = project.tasks
        .filter((t) => t.status === task.status && t.id !== task.id)
        .sort((a, b) => {
          if (a.position !== undefined && b.position !== undefined) {
            return a.position - b.position
          }
          return 0
        })

      // Update positions for the remaining tasks
      const updatedTasksInSameStatus = tasksInSameStatus.map((t, index) => ({
        ...t,
        position: index,
      }))

      // Combine with tasks from other columns
      const updatedTasks = [
        ...project.tasks.filter((t) => t.status !== task.status),
        ...updatedTasksInSameStatus,
      ].filter((t) => t.id !== task.id)

      // Update the project
      const updatedProject = {
        ...project,
        tasks: updatedTasks,
      }

      updateProject(updatedProject)

      // Close the dialog
      onOpenChange(false)

      // Show toast with undo action
      toast.success("Task deleted", {
        description: "The task has been deleted.",
        action: {
          label: "Undo",
          onClick: () => {
            // Restore the original project state
            updateProject(originalProject)

            toast.success("Task restored", {
              description: "The task has been restored successfully.",
            })
          },
        },
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Error", {
        description: "Failed to delete the task. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStatus(TASK_STATUSES.TODO)
    setPriority(TASK_PRIORITIES.MEDIUM)
    setDueDate(undefined)
    setAssigneeId(undefined)
    setErrors({})
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className={errors.title ? "text-destructive" : ""}>
              Task Title
              <span className="text-destructive"> *</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) {
                  setErrors({ ...errors, title: undefined })
                }
              }}
              placeholder="Enter task title"
              className={errors.title ? "border-destructive" : ""}
              aria-invalid={errors.title ? "true" : "false"}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-destructive">
                {errors.title}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TASK_STATUSES.TODO}>To Do</SelectItem>
                  <SelectItem value={TASK_STATUSES.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={TASK_STATUSES.REVIEW}>Review</SelectItem>
                  <SelectItem value={TASK_STATUSES.DONE}>Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TASK_PRIORITIES.LOW}>Low</SelectItem>
                  <SelectItem value={TASK_PRIORITIES.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TASK_PRIORITIES.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className={errors.dueDate ? "text-destructive" : ""}>
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dueDate"
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground",
                      errors.dueDate && "border-destructive text-destructive",
                    )}
                    aria-label={dueDate ? `Due date: ${format(dueDate, "PPP")}` : "Select due date"}
                    aria-invalid={errors.dueDate ? "true" : "false"}
                    aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date)
                      if (errors.dueDate) {
                        setErrors({ ...errors, dueDate: undefined })
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && (
                <p id="dueDate-error" className="text-sm text-destructive">
                  {errors.dueDate}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Assign to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {project.teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {task && (
              <DeleteConfirmPopover onConfirm={handleDeleteTask} isDeleting={isDeleting} triggerClassName="mr-auto" />
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isDeleting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {task ? "Updating..." : "Creating..."}
                </>
              ) : task ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

