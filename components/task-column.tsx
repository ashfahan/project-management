"use client"

import { Card, CardContent } from "@/components/ui/card"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Task } from "@/types/project"
import TaskCard from "./task-card"

// Placeholder component to reduce duplication
const DropPlaceholder = () => (
  <div className="min-h-[70px] sm:min-h-[80px] mb-3 rounded-lg animate-pulse relative z-10">
    <div className="bg-primary/15 border-2 border-dashed border-primary/50 rounded-lg h-full w-full flex items-center justify-center text-primary font-medium shadow-md p-4 text-sm sm:text-base">
      <span>Drop here</span>
    </div>
  </div>
)

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

  const columnClassName = `transition-colors duration-200 cursor-default ${
    isOver ? "bg-accent/50 ring-2 ring-primary/20" : ""
  } ${isActiveColumn ? "ring-2 ring-primary/20" : ""}`

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={columnClassName}
      data-column-id={id}
      data-is-over={isOver ? "true" : "false"}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-2 flex flex-col gap-3 overflow-y-auto h-[500px] sm:h-[650px]">
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasksWithPlaceholder.map((task) =>
            "isPlaceholder" in task ? (
              <DropPlaceholder key="placeholder" />
            ) : (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ),
          )}
        </SortableContext>

        {/* Empty column placeholder - only shown when dragging over an empty column from a different column */}
        {isDraggingFromDifferentColumn && tasks.length === 0 && (
          <div className="mt-auto mb-0 flex-grow flex items-center justify-center min-h-[70px] sm:min-h-[80px] animate-pulse">
            <div className="bg-primary/15 border-2 border-dashed border-primary/50 rounded-lg h-full w-full flex items-center justify-center text-primary font-medium shadow-md p-4 text-sm sm:text-base">
              <span>Drop here</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

