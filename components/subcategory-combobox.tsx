"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Subcategory } from "@/contexts/data-context"

interface SubcategoryComboboxProps {
  subcategories: Subcategory[]
  value: number | null
  onValueChange: (subcategoryId: number) => void
  onCreateSubcategory: (name: string) => number
  categoryId: number | null
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

export function SubcategoryCombobox({
  subcategories,
  value,
  onValueChange,
  onCreateSubcategory,
  categoryId,
  placeholder = "Select subcategory...",
  disabled = false,
  error = false,
}: SubcategoryComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedSubcategory = subcategories.find((subcategory) => subcategory.id === value)

  const filteredSubcategories = subcategories.filter((subcategory) =>
    subcategory.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  const showCreateOption = searchValue.trim().length > 0 && 
    !subcategories.some(subcategory => 
      subcategory.name.toLowerCase() === searchValue.toLowerCase().trim()
    ) && categoryId !== null

  const handleSelect = (subcategoryId: number) => {
    onValueChange(subcategoryId)
    setOpen(false)
    setSearchValue("")
  }

  const handleCreateNew = () => {
    const trimmedName = searchValue.trim()
    if (trimmedName && categoryId) {
      const newSubcategoryId = onCreateSubcategory(trimmedName)
      onValueChange(newSubcategoryId)
      setOpen(false)
      setSearchValue("")
    }
  }

  const getPlaceholderText = () => {
    if (!categoryId) {
      return "Select a category first"
    }
    return placeholder
  }

  const isDisabled = disabled || !categoryId

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            error && "border-red-500 hover:border-red-500",
            !selectedSubcategory && "text-muted-foreground",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={isDisabled}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {!categoryId && (
              <AlertCircle className="h-4 w-4 text-muted-foreground/70" />
            )}
            <span className="truncate">
              {selectedSubcategory ? selectedSubcategory.name : getPlaceholderText()}
            </span>
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" side="bottom" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={categoryId ? "Search subcategories..." : "Select a category first"}
            className="h-9 focus:outline-none" 
            disabled={!categoryId}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-none overflow-visible">
            <CommandEmpty>
              {!categoryId ? (
                <div className="text-center py-6 space-y-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Please select a category first
                  </p>
                </div>
              ) : searchValue.trim() ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    No subcategories found for "{searchValue.trim()}"
                  </p>
                </div>
              ) : (
                "No subcategories available"
              )}
            </CommandEmpty>
            {categoryId && (
              <CommandGroup>
                {filteredSubcategories.map((subcategory) => (
                  <CommandItem
                    key={subcategory.id}
                    value={subcategory.name}
                    onSelect={() => handleSelect(subcategory.id)}
                    className="flex items-start gap-3"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 mt-0.5 shrink-0",
                        value === subcategory.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium text-sm">{subcategory.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {subcategory.tasks.length} task{subcategory.tasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </CommandItem>
                ))}
                {showCreateOption && (
                  <CommandItem
                    value={`create-${searchValue.trim()}`}
                    onSelect={handleCreateNew}
                    className="flex items-start gap-3 text-primary border-dashed border border-primary/30 hover:bg-primary/5 hover:border-primary/50"
                  >
                    <Plus className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium text-sm">Create new subcategory</span>
                      <span className="text-xs">"{searchValue.trim()}"</span>
                    </div>
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}