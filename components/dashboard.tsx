"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import ProjectCard from "./project-card"
import TaskBoard from "./task-board"
import { useProjects } from "@/hooks/use-projects"
import CreateProjectDialog from "./create-project-dialog"
import type { Project } from "@/types/project"
import { ThemeToggle } from "./theme-toggle"
import { SeedDataButton } from "./seed-data-button"

export default function Dashboard() {
  const { projects, activeProject, setActiveProject } = useProjects()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("projects")

  const handleProjectSelect = (project: Project) => {
    setActiveProject(project)
    setActiveTab("board")
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SeedDataButton />
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="board" disabled={!activeProject}>
            Task Board
          </TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectSelect(project)}
                isActive={activeProject?.id === project.id}
              />
            ))}
            {projects.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create your first project
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="board">{activeProject && <TaskBoard project={activeProject} />}</TabsContent>
      </Tabs>

      <CreateProjectDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}

