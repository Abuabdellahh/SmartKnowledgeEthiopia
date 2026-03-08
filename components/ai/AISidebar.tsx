"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { MessageSquare, HelpCircle, FileText, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"
import { useUserRole } from "@/lib/useUserRole"

type Tool = "chat" | "explain" | "summary" | "questions"

interface AISidebarProps {
  currentText: string
}

export function AISidebar({ currentText }: AISidebarProps) {
  const { role, loading } = useUserRole()
  const [open, setOpen] = useState(true)
  const [activeTool, setActiveTool] = useState<Tool>("chat")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const aiAllowed = role === "student" || role === "teacher" || role === "admin"

  const { mutate: runTool, isLoading } = useMutation({
    mutationFn: async (tool: Tool) => {
      if (!aiAllowed) throw new Error("Not allowed")
      const body =
        tool === "chat"
          ? { message: input, context: currentText }
          : { text: currentText }

      const { data, error } = await supabase.functions.invoke("ai-sidebar-tools", {
        body: { tool, ...body },
      })
      if (error) throw error
      return (data?.output as string) ?? ""
    },
    onSuccess: (text) => setOutput(text),
  })

  if (loading) return null

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-border bg-muted/40 transition-all ${
        open ? "w-80" : "w-10"
      }`}
    >
      <div className="flex items-center justify-between px-2 py-2 border-b border-border">
        <button
          className="flex items-center gap-2 text-xs font-semibold px-2 py-1"
          onClick={() => setOpen((o) => !o)}
        >
          <Sparkles className="h-3 w-3 text-primary" />
          {open && <span>AI Tools</span>}
        </button>
      </div>

      {open && (
        <div className="flex-1 flex flex-col p-2 gap-2">
          <div className="flex flex-wrap gap-1">
            <Button
              size="xs"
              variant={activeTool === "chat" ? "default" : "outline"}
              onClick={() => setActiveTool("chat")}
              disabled={!aiAllowed}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Chat
            </Button>
            <Button
              size="xs"
              variant={activeTool === "explain" ? "default" : "outline"}
              onClick={() => setActiveTool("explain")}
              disabled={!aiAllowed}
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Explain
            </Button>
            <Button
              size="xs"
              variant={activeTool === "summary" ? "default" : "outline"}
              onClick={() => setActiveTool("summary")}
              disabled={!aiAllowed}
            >
              <FileText className="h-3 w-3 mr-1" />
              Summary
            </Button>
            <Button
              size="xs"
              variant={activeTool === "questions" ? "default" : "outline"}
              onClick={() => setActiveTool("questions")}
              disabled={!aiAllowed}
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Questions
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

          <Button
            size="sm"
            className="w-full"
            disabled={
              isLoading ||
              !aiAllowed ||
              (activeTool === "chat" && !input.trim())
            }
            onClick={() => runTool(activeTool)}
          >
            {isLoading ? "Thinking..." : `Run ${activeTool}`}
          </Button>

          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-2 h-full">
              <Textarea
                value={output}
                readOnly
                placeholder={
                  aiAllowed
                    ? "AI output will appear here."
                    : "Sign in as a student, teacher, or admin to use AI tools."
                }
                className="h-full text-xs"
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Role: {role}</span>
          </div>
        </div>
      )}
    </aside>
  )
}

