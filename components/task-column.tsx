"use client"

import { Card, CardContent } from "@/components/ui/card"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Task } from "@/types/project"
import TaskCard from "./task-card"

interface TaskColumnProps {
  id: string
  tasks: Task[]
  isActiveColumn: boolean
  isOver?: boolean
  dropPosition: number | null
  activeTaskColumn: string | null
  onTaskClick: (task: Task) => void
}

export function TaskColumn({
  id,
  tasks,
  isActiveColumn,
  isOver = false,
  dropPosition,
  activeTaskColumn,
  onTaskClick,
}: TaskColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    data: { type: "column" },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Only show placeholder when dragging from a different column
  const isDraggingFromDifferentColumn = isOver && activeTaskColumn !== null && activeTaskColumn !== id

  // Only show placeholders when dragging from a different column
  const showPlaceholder = isDraggingFromDifferentColumn && dropPosition !== null

  // Create a new array with placeholders inserted at the drop position
  const tasksWithPlaceholder = [...tasks]

  // Only insert a placeholder if we have tasks AND we're dragging from a different column
  if (
    showPlaceholder &&
    tasks.length > 0 &&
    dropPosition !== null &&
    dropPosition >= 0 &&
    dropPosition <= tasks.length
  ) {
    // Insert placeholder at the drop position
    tasksWithPlaceholder.splice(dropPosition, 0, {
      id: "placeholder",
      title: "",
      description: "",
      status: id,
      priority: "medium",
      position: -1,
      createdAt: "",
      isPlaceholder: true,
    } as Task & { isPlaceholder: boolean })
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`min-h-[500px] transition-colors duration-200 ${
        isOver ? "bg-accent/50 ring-2 ring-primary/20" : ""
      } ${isActiveColumn ? "active-column" : ""}`}
      data-column-id={id}
      data-is-over={isOver ? "true" : "false"}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-2 task-column">
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasksWithPlaceholder.map((task, index) =>
            "isPlaceholder" in task ? (
              <div key="placeholder" className="task-placeholder">
                <div className="task-placeholder-inner">
                  <span>Drop here</span>
                </div>
              </div>
            ) : (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ),
          )}
        </SortableContext>

        {/* Empty column placeholder - only shown when dragging over an empty column from a different column */}
        {isDraggingFromDifferentColumn && tasks.length === 0 && (
          <div className="drop-placeholder">
            <div className="drop-placeholder-inner">
              <span>Drop here</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

