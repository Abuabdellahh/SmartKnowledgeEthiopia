"use client"

import { useState } from "react"
import { Check, ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { categories } from "@/lib/mock-data"

interface CategoryFilterProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  className?: string
}

export function CategoryFilter({
  selectedCategories,
  onCategoriesChange,
  className
}: CategoryFilterProps) {
  const [open, setOpen] = useState(false)

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId))
    } else {
      onCategoriesChange([...selectedCategories, categoryId])
    }
  }

  const clearAll = () => {
    onCategoriesChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("justify-between gap-2", className)}
        >
          <Filter className="h-4 w-4" />
          <span>Categories</span>
          {selectedCategories.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {selectedCategories.length}
            </span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium">Filter by Category</span>
          {selectedCategories.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-primary hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id)
            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left",
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                )}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <span className="flex-1">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {category.bookCount}
                </span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
