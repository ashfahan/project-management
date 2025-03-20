"use client"

import { useState } from "react"
import { useProjects } from "./use-projects"
import { useTeamMembers } from "./use-team-members"
import { generateSeedTeamMembers, generateSeedProjects } from "@/utils/seed-data"

export function useSeedData() {
  const { setProjects } = useProjects()
  const { setTeamMembers } = useTeamMembers()
  const [isGenerating, setIsGenerating] = useState(false)

  const generateSeedData = async () => {
    try {
      setIsGenerating(true)

      // Generate team members
      const seedMembers = generateSeedTeamMembers()

      // Generate projects with those team members
      const seedProjects = generateSeedProjects(seedMembers)

      // Update state and localStorage
      setTeamMembers(seedMembers)
      setProjects(seedProjects, seedProjects.length > 0 ? seedProjects[0] : null)

      // No page reload needed - we'll update the state directly
    } catch (error) {
      console.error("Error generating seed data:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateSeedData,
    isGenerating,
  }
}

