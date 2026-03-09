"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Sparkles, X, ArrowRight, Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
  size?: "default" | "large"
  showSuggestions?: boolean
}

const recentSearches = [
  "Ethiopian History",
  "Machine Learning basics",
  "Amharic grammar"
]

const trendingTopics = [
  "AI in Education",
  "Climate Science",
  "Ethiopian Literature"
]

export function SearchBar({ 
  placeholder = "Search for books, topics, or ask a question...",
  onSearch,
  className,
  size = "default",
  showSuggestions = true
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query)
      } else {
        // Default: redirect to AI chat with query
        router.push(`/chat?q=${encodeURIComponent(query)}`)
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setIsFocused(false)
    if (onSearch) {
      onSearch(suggestion)
    } else {
      router.push(`/chat?q=${encodeURIComponent(suggestion)}`)
    }
  }

  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit}>
        <div 
          className={cn(
            "relative flex items-center rounded-xl border bg-card transition-all duration-200",
            isFocused 
              ? "border-primary ring-2 ring-primary/20 shadow-lg" 
              : "border-border hover:border-primary/50",
            size === "large" ? "h-16" : "h-12"
          )}
        >
          <Search className={cn(
            "absolute left-4 text-muted-foreground",
            size === "large" ? "h-5 w-5" : "h-4 w-4"
          )} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className={cn(
              "h-full w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none",
              size === "large" ? "pl-12 pr-32 text-lg" : "pl-11 pr-24 text-sm"
            )}
            aria-label="Search"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-24 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Button
            type="submit"
            size={size === "large" ? "default" : "sm"}
            className={cn(
              "absolute right-2 gap-2",
              size === "large" ? "h-10 px-4" : "h-8 px-3"
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && isFocused && !query && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-card p-4 shadow-xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Clock className="h-3 w-3" />
                Recent Searches
              </h4>
              <ul className="space-y-1">
                {recentSearches.map((search) => (
                  <li key={search}>
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(search)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      {search}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Trending Topics
              </h4>
              <ul className="space-y-1">
                {trendingTopics.map((topic) => (
                  <li key={topic}>
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(topic)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <Sparkles className="h-3 w-3 text-secondary" />
                      {topic}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
