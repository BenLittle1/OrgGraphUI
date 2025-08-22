"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useData } from "@/contexts/data-context"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface AssigneeSelectProps {
  taskId: number
  currentAssignee: string | null
  assignTaskToMember: (taskId: number, memberId: string | null) => void
}

export function AssigneeSelect({ taskId, currentAssignee, assignTaskToMember }: AssigneeSelectProps) {
  const { getTeamMembers } = useData()
  const [isOpen, setIsOpen] = useState(false)
  
  const teamMembers = getTeamMembers()
  
  // Find current team member by name
  const currentMember = teamMembers.find(member => member.name === currentAssignee)
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  const handleAssignmentChange = (value: string) => {
    if (value === "unassigned") {
      assignTaskToMember(taskId, null)
    } else {
      assignTaskToMember(taskId, value)
    }
    setIsOpen(false)
  }

  return (
    <Select
      value={currentMember?.id || "unassigned"} 
      onValueChange={handleAssignmentChange}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger className={cn(
        "h-8 min-w-[120px] justify-between font-normal pl-3 pr-2 py-1.5 hover:bg-accent/50 text-xs",
        !currentAssignee && "text-muted-foreground border-dashed"
      )}>
        <SelectValue asChild>
          <div className="flex items-center gap-1.5">
            {currentMember ? (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={currentMember.avatarUrl} alt={currentMember.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-[9px] font-medium flex items-center justify-center">
                    {getInitials(currentMember.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate max-w-20">
                  {currentMember.name.split(' ')[0]}
                </span>
              </>
            ) : (
              <>
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Unassigned
                </span>
              </>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-48">
        <SelectItem value="unassigned">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-sm">Unassigned</span>
          </div>
        </SelectItem>
        {teamMembers.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-[9px] font-medium flex items-center justify-center">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{member.name}</span>
                <span className="text-xs text-muted-foreground">{member.role}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}