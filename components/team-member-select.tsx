"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { v4 as uuidv4 } from "uuid"
import { useTeamMembers } from "@/hooks/use-team-members"
import { getInitials } from "@/utils/string-utils"

interface TeamMemberSelectProps {
  selectedMembers: { id: string; name: string; avatar: string }[]
  onChange: (members: { id: string; name: string; avatar: string }[]) => void
}

export default function TeamMemberSelect({ selectedMembers, onChange }: TeamMemberSelectProps) {
  const { teamMembers, addTeamMember } = useTeamMembers()
  const [open, setOpen] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelect = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId)
    if (!member) return

    const isSelected = selectedMembers.some((m) => m.id === memberId)

    if (isSelected) {
      onChange(selectedMembers.filter((m) => m.id !== memberId))
    } else {
      onChange([...selectedMembers, member])
    }
  }

  const handleRemove = (memberId: string) => {
    onChange(selectedMembers.filter((m) => m.id !== memberId))
  }

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {}

    if (!newMemberName.trim()) {
      newErrors.name = "Name is required"
    }

    if (newMemberEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newMemberEmail)) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddNewMember = () => {
    setIsSubmitting(true)

    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    const newMember = {
      id: uuidv4(),
      name: newMemberName,
      email: newMemberEmail,
      avatar: `/placeholder.svg?height=40&width=40`,
    }

    addTeamMember(newMember)
    setNewMemberName("")
    setNewMemberEmail("")
    setAddMemberOpen(false)
    onChange([...selectedMembers, newMember])
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setNewMemberName("")
    setNewMemberEmail("")
    setErrors({})
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            Select team members
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search team members..." />
            <CommandList>
              <CommandEmpty>No team members found.</CommandEmpty>
              <CommandGroup>
                {teamMembers.map((member) => (
                  <CommandItem key={member.id} value={member.id} onSelect={handleSelect}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar} alt={`Team member ${member.name}`} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedMembers.some((m) => m.id === member.id) ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="p-1 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false)
                  setAddMemberOpen(true)
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add new team member
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedMembers.map((member) => (
            <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
              <Avatar className="h-4 w-4 mr-1">
                <AvatarImage src={member.avatar} alt={`Team member ${member.name}`} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              {member.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleRemove(member.id)}
                aria-label={`Remove ${member.name}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <Dialog
        open={addMemberOpen}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            resetForm()
          }
          setAddMemberOpen(newOpen)
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                Name
                <span className="text-destructive"> *</span>
              </Label>
              <Input
                id="name"
                value={newMemberName}
                onChange={(e) => {
                  setNewMemberName(e.target.value)
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined })
                  }
                }}
                placeholder="Enter name"
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
              <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newMemberEmail}
                onChange={(e) => {
                  setNewMemberEmail(e.target.value)
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined })
                  }
                }}
                placeholder="Enter email"
                className={errors.email ? "border-destructive" : ""}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddMemberOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddNewMember} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

