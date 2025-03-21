"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { TeamMember } from "@/types/project"
import { LOCAL_STORAGE_KEYS } from "@/constants/app-constants"
import { useLocalStorage } from "./use-local-storage"
import { toast } from "sonner"

interface TeamMembersContextType {
  teamMembers: TeamMember[]
  addTeamMember: (member: TeamMember) => void
  updateTeamMember: (member: TeamMember) => void
  deleteTeamMember: (memberId: string) => void
  setTeamMembers: (members: TeamMember[]) => void
  clearTeamMembers: () => void
}

const TeamMembersContext = createContext<TeamMembersContextType | undefined>(undefined)

export function TeamMembersProvider({ children }: { children: ReactNode }) {
  const [teamMembers, setTeamMembersStorage, clearTeamMembersStorage] = useLocalStorage<TeamMember[]>(
    LOCAL_STORAGE_KEYS.TEAM_MEMBERS,
    [],
  )

  const addTeamMember = (member: TeamMember) => {
    try {
      console.log("Adding team member:", member)
      setTeamMembersStorage((prev) => [...(prev || []), member])

      toast.success("Team member added", {
        description: "The team member has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding team member:", error)
      toast.error("Error", {
        description: "Failed to add the team member. Please try again.",
      })
    }
  }

  const updateTeamMember = (updatedMember: TeamMember) => {
    try {
      console.log("Updating team member:", updatedMember)
      setTeamMembersStorage((prev) =>
        (prev || []).map((member) => (member.id === updatedMember.id ? updatedMember : member)),
      )

      toast.success("Team member updated", {
        description: "The team member has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating team member:", error)
      toast.error("Error", {
        description: "Failed to update the team member. Please try again.",
      })
    }
  }

  const deleteTeamMember = (memberId: string) => {
    try {
      console.log("Deleting team member:", memberId)

      // Update the state with the filtered team members
      const updatedMembers = (teamMembers || []).filter((member) => member.id !== memberId)
      console.log("Updated team members:", updatedMembers)

      // Update localStorage
      setTeamMembersStorage(updatedMembers)

      toast.success("Team member deleted", {
        description: "The team member has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting team member:", error)
      toast.error("Error", {
        description: "Failed to delete the team member. Please try again.",
      })
    }
  }

  const setTeamMembers = (members: TeamMember[]) => {
    try {
      setTeamMembersStorage(members)
    } catch (error) {
      console.error("Error setting team members:", error)
    }
  }

  const clearTeamMembers = () => {
    try {
      clearTeamMembersStorage()

      toast.success("Team members cleared", {
        description: "All team members have been cleared.",
      })
    } catch (error) {
      console.error("Error clearing team members:", error)
      toast.error("Error", {
        description: "Failed to clear team members. Please try again.",
      })
    }
  }

  return (
    <TeamMembersContext.Provider
      value={{
        teamMembers: teamMembers || [],
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        setTeamMembers,
        clearTeamMembers,
      }}
    >
      {children}
    </TeamMembersContext.Provider>
  )
}

export function useTeamMembers() {
  const context = useContext(TeamMembersContext)
  if (context === undefined) {
    throw new Error("useTeamMembers must be used within a TeamMembersProvider")
  }
  return context
}

