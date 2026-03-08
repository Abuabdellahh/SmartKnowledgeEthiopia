"use client"

import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, BookOpen } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface Citation {
  id: string
  title: string
  author?: string
  page?: number
  url?: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  citations?: Citation[]
  isStreaming?: boolean
}

interface MessageBubbleProps {
  message: Message
  className?: string
}

export function MessageBubble({ message, className }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)

  const isUser = message.role === "user"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn(
      "flex gap-4 px-4 py-6",
      isUser ? "bg-transparent" : "bg-muted/30",
      className
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        isUser ? "bg-primary" : "bg-secondary"
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-secondary-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {isUser ? "You" : "SKE Assistant"}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Message content */}
        <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
          <p className="whitespace-pre-wrap leading-relaxed">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
            )}
          </p>
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sources
            </h4>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((citation, index) => (
                <button
                  key={citation.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs hover:bg-muted transition-colors"
                >
                  <BookOpen className="h-3 w-3 text-primary" />
                  <span className="font-medium">[{index + 1}]</span>
                  <span className="truncate max-w-[150px]">{citation.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions (for assistant messages) */}
        {!isUser && !message.isStreaming && (
          <div className="flex items-center gap-1 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">{copied ? "Copied" : "Copy"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                feedback === "up" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setFeedback(feedback === "up" ? null : "up")}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="sr-only">Good response</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                feedback === "down" ? "text-destructive" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setFeedback(feedback === "down" ? null : "down")}
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="sr-only">Bad response</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
