"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Project } from "@/types/project"
import { LOCAL_STORAGE_KEYS } from "@/constants/app-constants"
import { useToast } from "@/hooks/use-toast"

interface ProjectsContextType {
  projects: Project[]
  activeProject: Project | null
  setActiveProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  deleteProject: (projectId: string) => void
  setProjects: (projects: Project[], activeProject: Project | null) => void
  clearProjects: () => void
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProjectState] = useState<Project | null>(null)
  const { toast } = useToast()

  // Load projects from localStorage on initial render
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS)
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects)
        setProjects(parsedProjects)
        if (parsedProjects.length > 0) {
          setActiveProjectState(parsedProjects[0])
        }
      }
    } catch (error) {
      console.error("Failed to parse projects from localStorage:", error)
    }
  }, [])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
    } catch (error) {
      console.error("Failed to save projects to localStorage:", error)
    }
  }, [projects])

  const addProject = (project: Project) => {
    try {
      console.log("Adding project:", project)

      // Create a new array with the new project
      const newProjects = [...projects, project]

      // Update state
      setProjects(newProjects)
      setActiveProjectState(project)

      toast({
        title: "Project created",
        description: "The project has been created successfully.",
      })
    } catch (error) {
      console.error("Error adding project:", error)
      toast({
        title: "Error",
        description: "Failed to create the project. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateProject = (updatedProject: Project) => {
    try {
      console.log("Updating project:", updatedProject.id)

      // Create a deep copy of the updated project to avoid reference issues
      const projectCopy = JSON.parse(JSON.stringify(updatedProject))

      // Create a new array with the updated project
      const newProjects = projects.map((project) => (project.id === projectCopy.id ? projectCopy : project))

      // Update state
      setProjects(newProjects)

      // Update the active project if needed
      if (activeProject?.id === projectCopy.id) {
        setActiveProjectState(projectCopy)
      }
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        title: "Error",
        description: "Failed to update the project. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteProject = (projectId: string) => {
    try {
      console.log("Deleting project:", projectId)

      // Create a new array without the deleted project
      const newProjects = projects.filter((project) => project.id !== projectId)

      // Update state
      setProjects(newProjects)

      // Update active project if needed
      if (activeProject?.id === projectId) {
        const newActiveProject = newProjects.length > 0 ? newProjects[0] : null
        setActiveProjectState(newActiveProject)
      }

      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      })
    }
  }

  const setProjectsWithActive = (newProjects: Project[], newActiveProject: Project | null) => {
    try {
      setProjects(newProjects)
      setActiveProjectState(newActiveProject)
    } catch (error) {
      console.error("Error setting projects:", error)
    }
  }

  const clearProjects = () => {
    try {
      setProjects([])
      setActiveProjectState(null)
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PROJECTS)

      toast({
        title: "Projects cleared",
        description: "All projects have been cleared.",
      })
    } catch (error) {
      console.error("Error clearing projects:", error)
      toast({
        title: "Error",
        description: "Failed to clear projects. Please try again.",
        variant: "destructive",
      })
    }
  }

  const setActiveProject = (project: Project | null) => {
    setActiveProjectState(project)
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        addProject,
        updateProject,
        deleteProject,
        setProjects: setProjectsWithActive,
        clearProjects,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider")
  }
  return context
}

