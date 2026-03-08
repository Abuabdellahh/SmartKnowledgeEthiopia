"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageBubble, type Message } from "@/components/message-bubble"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ChatWindowProps {
  bookContext?: { id: string; title: string } | null
  initialMessages?: Message[]
  className?: string
}

const suggestedPrompts = [
  "Summarize the main concepts",
  "What are the key takeaways?",
  "Explain this in simple terms",
  "How does this relate to real-world applications?"
]

export function ChatWindow({ bookContext, initialMessages = [], className }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(content, bookContext?.title),
        timestamp: new Date(),
        citations: bookContext ? [
          { id: "1", title: bookContext.title, page: Math.floor(Math.random() * 200) + 1 },
          { id: "2", title: "Related Academic Source", page: 45 }
        ] : undefined
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(input)
    }
  }

  return (
    <div className={cn("flex flex-col h-full bg-background rounded-xl border border-border", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground">SKE Knowledge Assistant</h3>
          {bookContext && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Context: {bookContext.title}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              How can I help you today?
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {bookContext 
                ? `Ask me anything about "${bookContext.title}" or related topics.`
                : "Ask questions about books, research topics, or get help with your studies."
              }
            </p>
            <div className="grid gap-2 w-full max-w-sm">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSubmit(prompt)}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-secondary shrink-0" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-4 px-4 py-6 bg-muted/30">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Loader2 className="h-4 w-4 text-secondary-foreground animate-spin" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Thinking</span>
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="min-h-[60px] max-h-[200px] pr-12 resize-none"
            rows={2}
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2 h-8 w-8"
            onClick={() => handleSubmit(input)}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          AI responses are generated based on available knowledge. Always verify important information.
        </p>
      </div>
    </div>
  )
}

function generateMockResponse(query: string, bookTitle?: string): string {
  const responses = [
    `Based on my analysis${bookTitle ? ` of "${bookTitle}"` : ""}, here's what I found:\n\nThe key concepts relate to understanding the fundamental principles and their practical applications. The material emphasizes both theoretical foundations and real-world implementations.\n\nKey points to remember:\n1. The foundational concepts build upon established research\n2. Practical applications extend across multiple domains\n3. Understanding the core principles enables deeper comprehension`,
    `That's a great question! ${bookTitle ? `Looking at "${bookTitle}", ` : ""}I can provide the following insights:\n\nThe topic you're asking about involves several interconnected ideas. First, there's the theoretical framework that establishes the baseline understanding. Then, we see how these theories translate into practice.\n\nFor Ethiopian students and researchers, this is particularly relevant because it connects to local contexts and applications.`,
    `Let me explain this in a clear and accessible way:\n\n${bookTitle ? `From "${bookTitle}", we learn that ` : ""}The main idea revolves around systematic approaches to problem-solving and knowledge acquisition. This involves:\n\n• Identifying core principles\n• Applying analytical frameworks\n• Synthesizing information from multiple sources\n\nThe Ethiopian educational context provides unique opportunities to apply these concepts.`
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}
