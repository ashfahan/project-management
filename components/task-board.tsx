"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import TaskCard from "./task-card"
import type { Project, Task } from "@/types/project"
import { useProjects } from "@/hooks/use-projects"
import TaskDialog from "./task-dialog"
import { COLUMNS } from "@/constants/app-constants"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable"
import { TaskColumn } from "./task-column"
import { createPortal } from "react-dom"
import { toast } from "sonner"

interface TaskBoardProps {
  project: Project
}

export default function TaskBoard({ project }: TaskBoardProps) {
  const { updateProject } = useProjects()
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeColumn, setActiveColumn] = useState<string | null>(null)
  const [overColumn, setOverColumn] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<number | null>(null)
  const isDraggingRef = useRef(false)

  // Set up sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Get tasks by status with memoization
  const getTasksByStatus = useCallback(
    (status: string) => {
      return project.tasks
        .filter((task) => task.status === status)
        .sort((a, b) => {
          if (a.position !== undefined && b.position !== undefined) {
            return a.position - b.position
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        })
    },
    [project.tasks],
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const taskId = active.id as string
    const task = project.tasks.find((t) => t.id === taskId)

    if (task) {
      setActiveTask(task)
      setActiveColumn(task.status)
      isDraggingRef.current = true
      document.body.classList.add("cursor-grabbing")
    }
  }

  const findDropPosition = useCallback(
    (event: DragOverEvent, columnId: string) => {
      // If over empty space in the column or at the end
      const tasksInColumn = getTasksByStatus(columnId)

      if (tasksInColumn.length === 0) {
        return 0 // First position if column is empty
      }

      // Get the client coordinates of the drag event
      const y =
        "touches" in event.activatorEvent
          ? (event.activatorEvent as TouchEvent).touches[0].clientY
          : (event.activatorEvent as MouseEvent).clientY

      // Find all task elements in this column
      const columnElement = document.querySelector(`[data-column-id="${columnId}"]`)
      if (!columnElement) return tasksInColumn.length

      const taskElements = Array.from(columnElement.querySelectorAll("[data-task-id]"))
      if (taskElements.length === 0) return 0

      // Find the task element the cursor is closest to
      for (let i = 0; i < taskElements.length; i++) {
        const taskElement = taskElements[i]
        const rect = taskElement.getBoundingClientRect()
        const taskMiddle = rect.top + rect.height / 2

        if (y < taskMiddle) {
          return i
        }
      }

      return tasksInColumn.length
    },
    [getTasksByStatus],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event

      if (!over) {
        setOverColumn(null)
        setDropPosition(null)
        return
      }

      const overId = over.id as string
      const activeId = active.id as string

      // If the task is dragged over a column
      if (COLUMNS.some((col) => col.id === overId)) {
        setOverColumn(overId)

        // For empty columns, always set position to 0
        const tasksInColumn = getTasksByStatus(overId)
        if (tasksInColumn.length === 0) {
          setDropPosition(0)
        } else {
          const position = findDropPosition(event, overId)
          setDropPosition(position)
        }
      } else {
        // If dragged over another task, find its column
        const overTask = project.tasks.find((t) => t.id === overId)
        if (overTask) {
          setOverColumn(overTask.status)

          // Get all tasks in this column
          const tasksInColumn = getTasksByStatus(overTask.status)

          // Find the index of the task we're over
          const overTaskIndex = tasksInColumn.findIndex((t) => t.id === overId)

          // Get the mouse position
          const y =
            "touches" in event.activatorEvent
              ? (event.activatorEvent as TouchEvent).touches[0].clientY
              : (event.activatorEvent as MouseEvent).clientY

          // Get the element we're over
          const overElement = document.querySelector(`[data-task-id="${overId}"]`)

          if (overElement) {
            const rect = overElement.getBoundingClientRect()
            const isInTopHalf = y < rect.top + rect.height / 2

            // If in top half, insert before; if in bottom half, insert after
            const position = isInTopHalf ? overTaskIndex : overTaskIndex + 1

            // Don't set a position if we're hovering over ourselves
            if (activeId !== overId || activeColumn !== overTask.status) {
              setDropPosition(position)
            }
          } else {
            // Fallback to the old method if we can't find the element
            const position = findDropPosition(event, overTask.status)
            setDropPosition(position)
          }
        }
      }
    },
    [project.tasks, findDropPosition, getTasksByStatus, activeColumn],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      // Get the current state before resetting
      const currentOverColumn = overColumn
      const currentDropPosition = dropPosition

      // Reset dragging state
      setActiveTask(null)
      setActiveColumn(null)
      setOverColumn(null)
      setDropPosition(null)
      isDraggingRef.current = false
      document.body.classList.remove("cursor-grabbing")

      if (!over || currentOverColumn === null) return

      const activeTaskId = active.id as string
      const overId = over.id as string

      // Find the task that was dragged
      const draggedTask = project.tasks.find((t) => t.id === activeTaskId)
      if (!draggedTask) return

      // Determine target column
      const isOverColumn = COLUMNS.some((col) => col.id === overId)
      let targetColumnId = isOverColumn ? overId : currentOverColumn

      if (!isOverColumn) {
        const overTask = project.tasks.find((t) => t.id === overId)
        if (overTask) {
          targetColumnId = overTask.status
        }
      }

      // Create a deep copy of all tasks
      let updatedTasks = JSON.parse(JSON.stringify(project.tasks)) as Task[]

      // Case 1: Moving between columns
      if (draggedTask.status !== targetColumnId) {
        // Remove the dragged task from its original position
        updatedTasks = updatedTasks.filter((t) => t.id !== activeTaskId)

        // Get tasks in destination column
        const tasksInDestination = updatedTasks
          .filter((t) => t.status === targetColumnId)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

        // Determine insertion position
        let insertPosition = currentDropPosition ?? tasksInDestination.length
        insertPosition = Math.max(0, Math.min(insertPosition, tasksInDestination.length))

        // Create updated task
        const updatedDraggedTask = {
          ...draggedTask,
          status: targetColumnId,
          position: insertPosition,
          updatedAt: new Date().toISOString(),
        }

        // Update positions for tasks in destination column
        for (let i = 0; i < tasksInDestination.length; i++) {
          if (i >= insertPosition) {
            tasksInDestination[i].position = i + 1
          } else {
            tasksInDestination[i].position = i
          }
        }

        // Update positions for tasks in source column
        const tasksInSource = updatedTasks
          .filter((t) => t.status === draggedTask.status)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

        tasksInSource.forEach((task, index) => {
          task.position = index
        })

        // Combine all tasks
        updatedTasks = [
          ...updatedTasks.filter((t) => t.status !== draggedTask.status && t.status !== targetColumnId),
          ...tasksInSource,
          ...tasksInDestination.slice(0, insertPosition),
          updatedDraggedTask,
          ...tasksInDestination.slice(insertPosition),
        ]
      }
      // Case 2: Reordering within the same column
      else {
        const tasksInColumn = getTasksByStatus(targetColumnId)
        const draggedIndex = tasksInColumn.findIndex((t) => t.id === activeTaskId)

        let insertPosition = currentDropPosition ?? draggedIndex
        insertPosition = Math.max(0, Math.min(insertPosition, tasksInColumn.length - 1))

        if (draggedIndex === insertPosition) return

        // Create reordered tasks array
        const reorderedTasks = arrayMove(tasksInColumn, draggedIndex, insertPosition)

        // Update positions
        const updatedColumnTasks = reorderedTasks.map((task, index) => ({
          ...task,
          position: index,
          updatedAt: task.id === activeTaskId ? new Date().toISOString() : task.updatedAt,
        }))

        updatedTasks = [...updatedTasks.filter((t) => t.status !== targetColumnId), ...updatedColumnTasks]
      }

      // Update the project
      updateProject({
        ...project,
        tasks: updatedTasks,
      })

      // Show toast notification
      toast.success("Task moved", {
        description: "The task has been moved successfully.",
      })
    },
    [project, overColumn, dropPosition, getTasksByStatus, updateProject],
  )

  const handleAddTask = () => {
    setEditingTask(null)
    setIsTaskDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    if (!isDraggingRef.current) {
      setEditingTask(task)
      setIsTaskDialogOpen(true)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold truncate">{project.name} Tasks</h2>
        </div>
        <Button onClick={handleAddTask} className="w-full sm:w-auto h-9">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="w-full overflow-x-auto pb-4 -mx-2 px-2 sm:mx-0 sm:px-0 touch-pan-x">
          <div className="flex flex-row min-w-max gap-4">
            {COLUMNS.map((column) => {
              const tasksInColumn = getTasksByStatus(column.id)
              const isActiveColumn = activeColumn === column.id
              const isOverThisColumn = overColumn === column.id

              return (
                <div key={column.id} className="flex-none w-[280px] sm:w-[300px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm sm:text-base">{column.title}</h3>
                    <span className="text-xs sm:text-sm text-muted-foreground">{tasksInColumn.length}</span>
                  </div>
                  <TaskColumn
                    id={column.id}
                    tasks={tasksInColumn}
                    isActiveColumn={isActiveColumn}
                    isOver={isOverThisColumn}
                    dropPosition={isOverThisColumn ? dropPosition : null}
                    activeTaskColumn={activeColumn}
                    onTaskClick={handleEditTask}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay adjustScale={false}>
              {activeTask && (
                <div className="w-[250px] min-h-[140px] sm:min-h-[160px] rotate-2 scale-105 shadow-lg pointer-events-none z-50">
                  <TaskCard task={activeTask} onClick={() => {}} isDragging={true} />
                </div>
              )}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>

      {isTaskDialogOpen && (
        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={(open) => {
            setIsTaskDialogOpen(open)
            if (!open) setEditingTask(null)
          }}
          project={project}
          task={editingTask}
        />
      )}
    </div>
  )
}

