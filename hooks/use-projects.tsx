"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Project } from "@/types/project"
import { LOCAL_STORAGE_KEYS } from "@/constants/app-constants"
import { useLocalStorage } from "./use-local-storage"

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
  const [projects, setProjectsStorage, clearProjectsStorage] = useLocalStorage<Project[]>(
    LOCAL_STORAGE_KEYS.PROJECTS,
    [],
  )
  const [activeProject, setActiveProjectState] = useState<Project | null>(null)

  // Initialize active project from stored projects
  useState(() => {
    if (projects && projects.length > 0 && !activeProject) {
      setActiveProjectState(projects[0])
    }
  })

  const addProject = (project: Project) => {
    setProjectsStorage((prev) => [...(prev || []), project])
    setActiveProjectState(project)
  }

  const updateProject = (updatedProject: Project) => {
    setProjectsStorage((prev) =>
      (prev || []).map((project) => (project.id === updatedProject.id ? updatedProject : project)),
    )

    if (activeProject?.id === updatedProject.id) {
      setActiveProjectState(updatedProject)
    }
  }

  const deleteProject = (projectId: string) => {
    setProjectsStorage((prev) => (prev || []).filter((project) => project.id !== projectId))

    if (activeProject?.id === projectId) {
      setActiveProjectState(null)
    }
  }

  const setProjects = (newProjects: Project[], newActiveProject: Project | null) => {
    setProjectsStorage(newProjects)
    setActiveProjectState(newActiveProject)
  }

  const clearProjects = () => {
    clearProjectsStorage()
    setActiveProjectState(null)
  }

  const setActiveProject = (project: Project | null) => {
    setActiveProjectState(project)
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects: projects || [],
        activeProject,
        setActiveProject,
        addProject,
        updateProject,
        deleteProject,
        setProjects,
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

