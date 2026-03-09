"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Bot,
  BookOpen,
  Check,
  Copy,
  Info,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { sampleChatMessages, type Book, type ChatMessage } from "@/lib/mock-data"
import { supabase } from "@/lib/supabaseClient"
import { mapDbBook } from "@/lib/dataMappers"

export function ChatClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookId = searchParams.get("book")
  const [books, setBooks] = useState<Book[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [contextBook, setContextBook] = useState<string | null>(bookId)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login?redirect=/chat")
        return
      }

      const userRole = (user.user_metadata as any)?.role as string | undefined
      setRole(userRole ?? null)

      if (!["student", "teacher", "admin"].includes(userRole ?? "")) {
        setCheckingAccess(false)
        return
      }

      const { data } = await supabase.from("books").select("*").order("title")
      setBooks((data ?? []).map(mapDbBook) as Book[])
      setCheckingAccess(false)
    }

    init()
  }, [router])

  const selectedBook = contextBook ? books.find((b) => b.id === contextBook) : null

  const welcomeMessage = selectedBook
    ? `Ask me anything about "${selectedBook.title}"`
    : "Ask me anything about Ethiopian history, culture, science, or any topic from our knowledge base."

  const suggestedQuestions = selectedBook
    ? [
        `What is "${selectedBook.title}" about?`,
        `Summarize the key points of this book`,
        `What are the main topics covered?`,
        `Explain the most important concepts`,
        `Give me 5 key takeaways from this book`,
      ]
    : [
        "What are the main themes of Ethiopian history?",
        "Explain the Aksumite Empire and its significance",
        "How has agriculture evolved in Ethiopia?",
        "What are the key principles of Ethiopian constitutional law?",
        "Summarize recent developments in Ethiopian education",
      ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const aiAllowed = ["student", "teacher", "admin"].includes(role ?? "")

  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking access...</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !aiAllowed) return

    const MAX_INPUT_LENGTH = 2000
    if (input.length > MAX_INPUT_LENGTH) {
      alert(`Message too long. Maximum ${MAX_INPUT_LENGTH} characters.`)
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      bookId: contextBook || undefined,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    const userInput = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { data, error } = await supabase.functions.invoke("quick-handler", {
        body: { tool: "chat", pageContent: userInput, bookId: contextBook },
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (error) throw error

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data?.output || "Sorry, I couldn't generate a response.",
        bookId: contextBook || undefined,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('AI Chat Error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get AI response'}. Make sure GROQ_API_KEY is configured in Supabase Edge Functions.`,
        bookId: contextBook || undefined,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
    textareaRef.current?.focus()
  }

  const handleCopyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleClearChat = () => {
    setMessages([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-4xl flex-1 flex flex-col px-4 py-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">AI Research Assistant</h1>
                  <p className="text-sm text-muted-foreground">
                    Ask questions about Ethiopian knowledge and research
                  </p>
                </div>
              </div>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="gap-2 text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Select
                value={contextBook || "general"}
                onValueChange={(v) => setContextBook(v === "general" ? null : v)}
              >
                <SelectTrigger className="w-[280px]">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select book context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      General Knowledge
                    </span>
                  </SelectItem>
                  {books.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      <span className="line-clamp-1">{book.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Select a specific book to get answers based on its content,
                      or use General Knowledge for broader questions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <ScrollArea className="flex-1 pr-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mt-6 text-xl font-semibold text-center">
                  Welcome to SKE AI Assistant
                </h2>
                <p className="mt-2 text-center text-muted-foreground max-w-md">
                  {welcomeMessage}
                </p>

                <div className="mt-8 w-full max-w-lg">
                  <p className="text-sm font-medium text-center mb-4">Try asking:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedQuestions.map((question) => (
                      <Button
                        key={question}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-2 px-3"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4",
                      message.role === "user" ? "flex-row-reverse" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        message.role === "user" ? "bg-primary" : "bg-muted"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <Bot className="h-4 w-4 text-foreground" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "group relative max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.bookId && message.role === "assistant" && (
                        <Badge variant="secondary" className="mb-2 text-xs">
                          <BookOpen className="mr-1 h-3 w-3" />
                          {books.find((b) => b.id === message.bookId)?.title}
                        </Badge>
                      )}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                      {message.role === "assistant" && (
                        <button
                          onClick={() =>
                            handleCopyMessage(message.id, message.content)
                          }
                          className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedId === message.id ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Bot className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="rounded-2xl bg-muted px-4 py-3">
                      <div className="flex gap-1">
                        <span
                          className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <div className="mt-4 border-t border-border pt-4">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  !aiAllowed
                    ? "AI chat is available for students, teachers, and admins."
                    : contextBook
                    ? `Ask about "${
                        books.find((b) => b.id === contextBook)?.title
                      }"...`
                    : "Ask anything about Ethiopian knowledge..."
                }
                className="min-h-[60px] resize-none pr-12"
                rows={2}
                disabled={!aiAllowed}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading || !aiAllowed}
                className="absolute bottom-2 right-2 h-8 w-8"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              AI responses are generated for demonstration. Connect Groq or Gemini
              API for real AI functionality.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function generateMockResponse(question: string, bookTitle?: string): string {
  const q = question.toLowerCase()

  if (q.includes("aksumite") || q.includes("aksum")) {
    return `The Aksumite Empire (c. 100-940 AD) was one of the great civilizations of the ancient world, centered in what is now northern Ethiopia and Eritrea.

**Key Achievements:**
- Developed its own alphabet (Ge'ez script)
- Created sophisticated architecture including the famous Aksum obelisks
- Was one of the first states to adopt Christianity (4th century AD)
- Minted its own currency
- Controlled trade routes between Africa, Arabia, and the Mediterranean

The empire was a major trading power, exporting ivory, gold, and other goods. Its adoption of Christianity made it one of the earliest Christian states in the world, profoundly shaping Ethiopian culture and identity.`
  }

  if (q.includes("history") || q.includes("theme")) {
    return `Ethiopian history encompasses several major themes:

1. **Ancient Civilization**: Ethiopia is one of the oldest nations, with the Aksumite Empire being among the great ancient civilizations.

2. **Religious Heritage**: Ethiopia was one of the first nations to adopt Christianity (4th century) and has significant Islamic heritage.

3. **Independence**: Unlike most African nations, Ethiopia was never colonized (except for a brief Italian occupation 1936-1941).

4. **Cultural Diversity**: With over 80 ethnic groups and languages, Ethiopia has rich cultural traditions.

5. **Modern Development**: From imperial rule through the Derg regime to the current federal system, Ethiopia continues to evolve.`
  }

  if (q.includes("agriculture")) {
    return `Agriculture in Ethiopia has evolved significantly:

**Traditional Period:**
- Dominated by subsistence farming
- Oxen-driven plowing with "maresha"
- Crop rotation and fallowing practices

**Modern Developments:**
- Introduction of improved seeds and fertilizers
- Expansion of irrigation systems
- Agricultural extension services
- Growth of commercial farming

**Current Focus:**
- Climate-resilient agriculture
- Sustainable farming practices
- Technology adoption (mobile advisory services)
- Export crop development (coffee, sesame, flowers)

Ethiopia remains an agricultural economy with about 70% of the population engaged in farming.`
  }

  if (bookTitle) {
    return `Based on "${bookTitle}", here's what I can tell you:

This resource covers important aspects related to your question. The book provides detailed analysis and context specific to Ethiopian studies.

**Key Points:**
- The material is designed for Ethiopian students and researchers
- It incorporates local context and examples
- The content is peer-reviewed and academically rigorous

For more detailed information, I recommend reading the full text or generating an AI summary of specific chapters.`
  }

  return `Thank you for your question about "${question}".

While I'm in demo mode without a connected AI backend, here's general information:

**Ethiopian Context:**
- Ethiopia has a rich knowledge tradition spanning millennia
- Academic institutions are growing rapidly
- Digital access to knowledge is expanding

**To get real AI-powered answers:**
1. Connect the Groq API for fast chat inference
2. Or connect Google Gemini for detailed reasoning
3. Enable semantic search with embeddings

Would you like to explore our book collection for more detailed information on this topic?`
}

