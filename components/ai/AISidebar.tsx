"use client"

import { useState, useRef, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { MessageSquare, HelpCircle, FileText, Sparkles, Volume2, VolumeX, ChevronLeft, ChevronRight, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"
import { useUserRole } from "@/lib/useUserRole"
import { useTextToSpeech } from "@/lib/useTextToSpeech"

type Tool = "summarize" | "explain" | "quiz" | "flashcards"

interface AISidebarProps {
  currentText: string
}

export function AISidebar({ currentText }: AISidebarProps) {
  const { role, loading } = useUserRole()
  const { speak, stop, allowed: ttsAllowed } = useTextToSpeech()
  const [open, setOpen] = useState(true)
  const [width, setWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const [activeTool, setActiveTool] = useState<Tool>("summarize")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)

  const aiAllowed = role === "student" || role === "teacher" || role === "admin"

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      e.preventDefault()
      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= 280 && newWidth <= 700) {
        setWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    if (isResizing) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const { mutate: runTool, isLoading } = useMutation({
    mutationFn: async (tool: Tool) => {
      if (!aiAllowed) throw new Error("Not allowed")
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")
      
      const { data, error } = await supabase.functions.invoke("quick-handler", {
        body: { tool, pageContent: currentText },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })
      if (error) throw error
      return (data?.output as string) ?? ""
    },
    onSuccess: (text) => setOutput(text),
    onError: (error) => {
      console.error('AI Error:', error)
      setOutput(`Error: ${error instanceof Error ? error.message : 'AI request failed'}. Make sure the edge function is deployed.`)
    }
  })

  const handleVoiceToggle = () => {
    if (!ttsAllowed) return
    if (isSpeaking) {
      stop()
      setIsSpeaking(false)
    } else {
      const textToSpeak = output || currentText
      if (textToSpeak) {
        speak(textToSpeak)
        setIsSpeaking(true)
      }
    }
  }

  if (loading) return null

  return (
    <aside
      ref={sidebarRef}
      style={{ width: open ? `${width}px` : '48px' }}
      className="hidden lg:flex flex-col border-r border-border bg-muted/40 relative flex-shrink-0"
    >
      {open && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-border hover:bg-primary cursor-col-resize z-50"
          onMouseDown={(e) => {
            e.preventDefault()
            setIsResizing(true)
          }}
        />
      )}
      <div className="flex items-center justify-between px-2 py-2 border-b border-border">
        {open ? (
          <>
            <div className="flex items-center gap-2 text-xs font-semibold px-2 py-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>AI Tools</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-6 w-6"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpen(true)}
            className="h-6 w-6 mx-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {open && (
        <div className="flex-1 flex flex-col p-2 gap-2 overflow-y-auto">
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant={activeTool === "summarize" ? "default" : "outline"}
              onClick={() => setActiveTool("summarize")}
              disabled={!aiAllowed}
              className="text-xs h-7"
            >
              <FileText className="h-3 w-3 mr-1" />
              Summarize
            </Button>
            <Button
              size="sm"
              variant={activeTool === "explain" ? "default" : "outline"}
              onClick={() => setActiveTool("explain")}
              disabled={!aiAllowed}
              className="text-xs h-7"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Explain
            </Button>
            <Button
              size="sm"
              variant={activeTool === "quiz" ? "default" : "outline"}
              onClick={() => setActiveTool("quiz")}
              disabled={!aiAllowed}
              className="text-xs h-7"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Quiz
            </Button>
            <Button
              size="sm"
              variant={activeTool === "flashcards" ? "default" : "outline"}
              onClick={() => setActiveTool("flashcards")}
              disabled={!aiAllowed}
              className="text-xs h-7"
            >
              <FileText className="h-3 w-3 mr-1" />
              Flashcards
            </Button>
          </div>

          {activeTool === "chat" && (
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                aiAllowed
                  ? "Ask a question about this page..."
                  : "AI tools are available for students, teachers, and admins."
              }
              disabled={!aiAllowed}
              className="min-h-[60px] text-xs"
            />
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 text-xs h-8"
              disabled={isLoading || !aiAllowed}
              onClick={() => runTool(activeTool)}
            >
              {isLoading ? "Thinking..." : `Run ${activeTool}`}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              disabled={!ttsAllowed || (!output && !currentText)}
              onClick={handleVoiceToggle}
              title={ttsAllowed ? (isSpeaking ? "Stop reading" : "Read aloud") : "Voice reading for students+"}
            >
              {isSpeaking ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Card className="flex-1 overflow-hidden border-2">
            <CardContent className="p-2 h-full">
              <Textarea
                value={output}
                readOnly
                placeholder={
                  aiAllowed
                    ? "AI output will appear here."
                    : "Sign in as a student, teacher, or admin to use AI tools."
                }
                className="h-full text-xs resize min-h-[200px] border-2"
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>Role: {role}</span>
            {ttsAllowed && (
              <span className="flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                TTS
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

