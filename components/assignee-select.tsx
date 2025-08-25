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
  compact?: boolean
}

export function AssigneeSelect({ taskId, currentAssignee, assignTaskToMember, compact = false }: AssigneeSelectProps) {
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
        "justify-between font-normal hover:bg-accent/50 text-xs flex items-center",
        compact ? "!h-6 min-w-[100px] pl-2 pr-1.5 py-0 leading-none" : "!h-7 min-w-[120px] pl-3 pr-2 py-0 leading-none",
        !currentAssignee && "text-muted-foreground border-dashed"
      )}>
        <SelectValue asChild>
          <div className="flex items-center gap-1.5">
            {currentMember ? (
              <>
                <Avatar className={compact ? "h-4 w-4" : "h-4 w-4"}>
                  <AvatarImage src={currentMember.avatarUrl} alt={currentMember.name} />
                  <AvatarFallback className={cn(
                    "bg-primary text-primary-foreground font-medium flex items-center justify-center leading-[1] align-middle",
                    compact ? "text-[8px]" : "text-[8px]"
                  )}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getInitials(currentMember.name)}
                  </AvatarFallback>
                </Avatar>
                <span className={cn(
                  "text-muted-foreground truncate",
                  compact ? "text-[11px] max-w-16" : "text-xs max-w-20"
                )}>
                  {currentMember.name.split(' ')[0]}
                </span>
              </>
            ) : (
              <>
                <User className={cn("text-muted-foreground", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
                <span className={cn("text-muted-foreground", compact ? "text-[11px]" : "text-xs")}>
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