"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

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
import { Category } from "@/contexts/data-context"

interface CategoryComboboxProps {
  categories: Category[]
  value: number | null
  onValueChange: (categoryId: number) => void
  onCreateCategory: (name: string) => number
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

export function CategoryCombobox({
  categories,
  value,
  onValueChange,
  onCreateCategory,
  placeholder = "Select category...",
  disabled = false,
  error = false,
}: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedCategory = categories.find((category) => category.id === value)

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  const showCreateOption = searchValue.trim().length > 0 && 
    !categories.some(category => 
      category.name.toLowerCase() === searchValue.toLowerCase().trim()
    )

  const handleSelect = (categoryId: number) => {
    onValueChange(categoryId)
    setOpen(false)
    setSearchValue("")
  }

  const handleCreateNew = () => {
    const trimmedName = searchValue.trim()
    if (trimmedName) {
      const newCategoryId = onCreateCategory(trimmedName)
      onValueChange(newCategoryId)
      setOpen(false)
      setSearchValue("")
    }
  }

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
            !selectedCategory && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {selectedCategory ? selectedCategory.name : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" side="bottom" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search categories..." 
            className="h-9 focus:outline-none"
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-none overflow-visible">
            <CommandEmpty>
              {searchValue.trim() ? "No categories found." : "Start typing to search..."}
            </CommandEmpty>
            <CommandGroup>
              {filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => handleSelect(category.id)}
                  className="flex items-start gap-3"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 mt-0.5 shrink-0",
                      value === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-sm">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {category.subcategories.length} subcategorie{category.subcategories.length !== 1 ? 's' : ''}
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
                    <span className="font-medium text-sm">Create new category</span>
                    <span className="text-xs">"{searchValue.trim()}"</span>
                  </div>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}