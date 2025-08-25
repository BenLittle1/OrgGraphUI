"use client"

import * as React from "react"
import { ChevronDownIcon, X, Calendar as CalendarIcon } from "lucide-react"
import { format, isValid, parseISO } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: string | null
  onDateChange: (date: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  disabled = false,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  // Always use the current date as today
  const today = React.useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  const selectedDate = React.useMemo(() => {
    if (!date) return undefined
    try {
      const parsed = parseISO(date)
      return isValid(parsed) ? parsed : undefined
    } catch {
      return undefined
    }
  }, [date])

  const handleDateSelect = (selected: Date | undefined) => {
    if (selected) {
      onDateChange(format(selected, "yyyy-MM-dd"))
    } else {
      onDateChange(null)
    }
    setIsOpen(false)
  }

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange(null)
  }

  const displayValue = selectedDate 
    ? format(selectedDate, "MMM dd, yyyy")
    : placeholder

  const isOverdue = selectedDate && selectedDate < today
  const isDueToday = selectedDate && 
    format(selectedDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "justify-between font-normal !h-7 min-w-[120px] pl-3 pr-2 py-0 hover:bg-accent/50 text-xs flex items-center leading-none",
            !selectedDate && "text-muted-foreground border-dashed",
            isOverdue && "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
            isDueToday && "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-3 w-3 shrink-0 opacity-70" />
            <span className="truncate">{displayValue}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto pl-2">
            {selectedDate && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClearDate}
              />
            )}
            <ChevronDownIcon className="h-4 w-4 shrink-0" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          captionLayout="dropdown"
          onSelect={handleDateSelect}
          defaultMonth={selectedDate || today}
          today={today}
          fromYear={today.getFullYear() - 1}
          toYear={today.getFullYear() + 5}
          disabled={(date) => {
            const oneYearAgo = new Date(today)
            oneYearAgo.setFullYear(today.getFullYear() - 1)
            return date < oneYearAgo
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}