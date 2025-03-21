"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProjects } from "@/hooks/use-projects"
import { v4 as uuidv4 } from "uuid"
import type { Project } from "@/types/project"
import TeamMemberSelect from "./team-member-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PROJECT_STATUSES } from "@/constants/app-constants"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { DeleteConfirmPopover } from "./delete-confirm-popover"

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
}

export default function ProjectDialog({ open, onOpenChange, project = null }: ProjectDialogProps) {
  const { addProject, updateProject, deleteProject } = useProjects()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState(PROJECT_STATUSES.ACTIVE)
  const [selectedMembers, setSelectedMembers] = useState<{ id: string; name: string; avatar: string }[]>([])
  const [errors, setErrors] = useState<{ name?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isEditing = !!project

  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description)
      setStatus(project.status)
      setSelectedMembers(project.teamMembers)
    } else {
      resetForm()
    }
  }, [project])

  const validateForm = () => {
    const newErrors: { name?: string } = {}

    if (!name.trim()) {
      newErrors.name = "Project name is required"
    } else if (name.length < 3) {
      newErrors.name = "Project name must be at least 3 characters"
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

    try {
      if (isEditing && project) {
        // Update existing project
        const updatedProject: Project = {
          ...project,
          name,
          description,
          status,
          teamMembers: selectedMembers,
          updatedAt: new Date().toISOString(),
        }

        updateProject(updatedProject)

        toast.success("Project updated", {
          description: "The project has been updated successfully.",
        })
      } else {
        // Create new project
        const newProject: Project = {
          id: uuidv4(),
          name,
          description,
          status: PROJECT_STATUSES.ACTIVE,
          teamMembers: selectedMembers,
          tasks: [],
          createdAt: new Date().toISOString(),
        }

        addProject(newProject)

        toast.success("Project created", {
          description: "The project has been created successfully.",
        })
      }

      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving project:", error)
      toast.error("Error", {
        description: `Failed to ${isEditing ? "update" : "create"} the project. Please try again.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (!project) return
    setIsDeleting(true)

    try {
      // Store a deep copy of the project for potential undo
      const projectToDelete = JSON.parse(JSON.stringify(project)) as Project

      // Delete the project
      deleteProject(project.id)

      // Close the dialog
      onOpenChange(false)

      // Show toast with undo action
      toast.success("Project deleted", {
        description: "The project has been deleted.",
        action: {
          label: "Undo",
          onClick: () => {
            // Restore the project
            addProject(projectToDelete)

            toast.success("Project restored", {
              description: "The project has been restored successfully.",
            })
          },
        },
      })
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("Error", {
        description: "Failed to delete the project. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setStatus(PROJECT_STATUSES.ACTIVE)
    setSelectedMembers([])
    setErrors({})
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetForm()
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Project" : "Create New Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
              Project Name
              <span className="text-destructive"> *</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) {
                  setErrors({ ...errors, name: undefined })
                }
              }}
              placeholder="Enter project name"
              className={errors.name ? "border-destructive" : ""}
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PROJECT_STATUSES.ACTIVE}>Active</SelectItem>
                  <SelectItem value={PROJECT_STATUSES.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={PROJECT_STATUSES.ON_HOLD}>On Hold</SelectItem>
                  <SelectItem value={PROJECT_STATUSES.PLANNING}>Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Team Members</Label>
            <TeamMemberSelect selectedMembers={selectedMembers} onChange={setSelectedMembers} />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing && (
              <DeleteConfirmPopover onConfirm={handleDelete} isDeleting={isDeleting} triggerClassName="mr-auto" />
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isDeleting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
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

