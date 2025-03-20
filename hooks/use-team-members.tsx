"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { TeamMember } from "@/types/project"
import { LOCAL_STORAGE_KEYS } from "@/constants/app-constants"
import { useLocalStorage } from "./use-local-storage"

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
    setTeamMembersStorage((prev) => [...(prev || []), member])
  }

  const updateTeamMember = (updatedMember: TeamMember) => {
    setTeamMembersStorage((prev) =>
      (prev || []).map((member) => (member.id === updatedMember.id ? updatedMember : member)),
    )
  }

  const deleteTeamMember = (memberId: string) => {
    setTeamMembersStorage((prev) => (prev || []).filter((member) => member.id !== memberId))
  }

  const setTeamMembers = (members: TeamMember[]) => {
    setTeamMembersStorage(members)
  }

  const clearTeamMembers = () => {
    clearTeamMembersStorage()
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

