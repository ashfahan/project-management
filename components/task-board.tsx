"use client"

import { useState, useCallback } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import TaskCard from "./task-card"
import type { Project, Task } from "@/types/project"
import { useProjects } from "@/hooks/use-projects"
import TaskDialog from "./task-dialog"
import { COLUMNS } from "@/constants/app-constants"

interface TaskBoardProps {
  project: Project
}

export default function TaskBoard({ project }: TaskBoardProps) {
  const { updateProject } = useProjects()
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Get tasks by status
  const getTasksByStatus = useCallback(
    (status: string) => {
      return project.tasks.filter((task) => task.status === status)
    },
    [project.tasks],
  )

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // Find the task that was dragged
    const task = project.tasks.find((t) => t.id === draggableId)
    if (!task) return

    // Create a new task with the updated status
    const updatedTask = {
      ...task,
      status: destination.droppableId,
    }

    // Create a new tasks array with the updated task
    const updatedTasks = project.tasks.map((t) => (t.id === draggableId ? updatedTask : t))

    // Update the project with the new tasks array
    updateProject({
      ...project,
      tasks: updatedTasks,
    })
  }

  const handleAddTask = () => {
    setEditingTask(null)
    setIsTaskDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleTaskDialogClose = (open: boolean) => {
    setIsTaskDialogOpen(open)
    if (!open) {
      setEditingTask(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{project.name} Tasks</h2>
        <Button onClick={handleAddTask}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((column) => {
            const tasksInColumn = getTasksByStatus(column.id)

            return (
              <div key={column.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{column.title}</h3>
                  <span className="text-sm text-muted-foreground">{tasksInColumn.length}</span>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <Card className="min-h-[500px]" ref={provided.innerRef} {...provided.droppableProps}>
                      <CardContent className="p-2 space-y-2">
                        {tasksInColumn.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="task-card-wrapper"
                              >
                                <TaskCard task={task} onClick={() => handleEditTask(task)} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </CardContent>
                    </Card>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {isTaskDialogOpen && (
        <TaskDialog open={isTaskDialogOpen} onOpenChange={handleTaskDialogClose} project={project} task={editingTask} />
      )}
    </div>
  )
}

