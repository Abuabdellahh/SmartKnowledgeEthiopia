"use client"

import { Sparkles, BookOpen, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Source {
  id: string
  title: string
  author?: string
  page?: number
  relevance: number
}

interface AIResponseCardProps {
  title: string
  summary: string
  keyPoints?: string[]
  sources?: Source[]
  isLoading?: boolean
  className?: string
}

export function AIResponseCard({
  title,
  summary,
  keyPoints,
  sources,
  isLoading,
  className
}: AIResponseCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Summary */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {summary}
        </p>

        {/* Key Points */}
        {keyPoints && keyPoints.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Key Points
            </h4>
            <ul className="space-y-2">
              {keyPoints.slice(0, expanded ? undefined : 3).map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            {keyPoints.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="w-full text-muted-foreground"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show {keyPoints.length - 3} More
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sources Used
            </h4>
            <div className="flex flex-wrap gap-2">
              {sources.map((source) => (
                <button
                  key={source.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs hover:bg-muted transition-colors"
                >
                  <BookOpen className="h-3 w-3 text-primary" />
                  <span className="max-w-[120px] truncate">{source.title}</span>
                  {source.page && (
                    <span className="text-muted-foreground">p.{source.page}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
