"use client"

import { useEffect, useState } from "react"
import { Upload, FileText, BookOpen, Sparkles, Volume2, Square } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { AISidebar } from "@/components/ai/AISidebar"
import { useTextToSpeech } from "@/lib/useTextToSpeech"

interface ReadingChunk {
  id: string
  document_id: string
  chunk_index: number
  content: string
}

export default function ReadingAssistantPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [chunks, setChunks] = useState<ReadingChunk[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [aiOutput, setAiOutput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const { speak, stop, allowed: ttsAllowed } = useTextToSpeech()

  const currentChunk = chunks[currentIndex]

  useEffect(() => {
    const loadRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const userRole = (user?.user_metadata as any)?.role as string | undefined
      setRole(userRole ?? null)
      setChecking(false)
    }
    loadRole()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setDocumentId(null)
      setChunks([])
      setCurrentIndex(0)
      setAiOutput("")
    }
  }

  const handleUploadAndProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    setAiOutput("")

    try {
      const userRes = await supabase.auth.getUser()
      if (!userRes.data.user) {
        throw new Error("You must be signed in to use the Reading Assistant.")
      }

      const path = `${userRes.data.user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from("reading-documents")
        .upload(path, file)

      if (uploadError) throw uploadError

      const title = file.name.replace(/\.[^.]+$/, "")
      const { data: doc, error: docError } = await supabase
        .from("reading_documents")
        .insert({
          user_id: userRes.data.user.id,
          title,
          original_filename: file.name,
          storage_path: path,
          mime_type: file.type || "application/octet-stream",
        })
        .select("id")
        .single()

      if (docError || !doc) throw docError || new Error("Failed to create document record")

      setDocumentId(doc.id)

      let text = ""
      if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
        text = await file.text()
      } else {
        text = await file.text()
      }

      const { error: fnError } = await supabase.functions.invoke("ai-reading-process", {
        body: { documentId: doc.id, text },
      })
      if (fnError) throw fnError

      const { data: chunkRows, error: chunksError } = await supabase
        .from("reading_chunks")
        .select("*")
        .eq("document_id", doc.id)
        .order("chunk_index", { ascending: true })

      if (chunksError) throw chunksError

      setChunks((chunkRows ?? []) as ReadingChunk[])
      setCurrentIndex(0)
    } catch (err) {
      console.error(err)
      alert(
        err instanceof Error
          ? err.message
          : "Failed to process document. Please try again.",
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const runTool = async (tool: "summary" | "explanation" | "questions" | "notes" | "translate") => {
    if (!documentId || !currentChunk) return
    setAiLoading(true)
    setAiOutput("")

    try {
      const { data, error } = await supabase.functions.invoke("ai-reading-tools", {
        body: {
          documentId,
          chunkIndex: currentChunk.chunk_index,
          tool,
          targetLanguage: tool === "translate" ? "Amharic" : undefined,
        },
      })
      if (error) throw error
      setAiOutput(data?.output ?? "")
    } catch (err) {
      console.error(err)
      alert(
        err instanceof Error
          ? err.message
          : "Failed to run AI tool. Please try again.",
      )
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    setAiOutput("")
  }, [currentIndex])

  const aiAllowed = ["student", "teacher", "admin"].includes(role ?? "")

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking access...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">AI Reading Assistant</h1>
                <p className="text-sm text-muted-foreground">
                  Upload a document and get summaries, explanations, questions, and notes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
            <Card>
              <CardContent className="py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Upload a document</p>
                    <p className="text-xs text-muted-foreground">
                      PDF or text files up to your Supabase limits.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-stretch sm:items-end">
                  <input
                    type="file"
                    accept=".pdf,.txt,text/plain,application/pdf"
                    onChange={handleFileChange}
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    disabled={!file || isProcessing || !aiAllowed}
                    onClick={handleUploadAndProcess}
                  >
                    {isProcessing
                      ? "Processing..."
                      : aiAllowed
                      ? "Upload & Process"
                      : "AI tools available for students/teachers/admins"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {chunks.length > 0 && (
              <div className="flex gap-4">
                <AISidebar currentText={currentChunk?.content ?? ""} />
                <div className="flex-1 grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardContent className="py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <p className="font-medium">Current page</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            Page {currentIndex + 1} of {chunks.length}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                          >
                            ‹
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            disabled={currentIndex === chunks.length - 1}
                            onClick={() =>
                              setCurrentIndex((i) =>
                                Math.min(chunks.length - 1, i + 1),
                              )
                            }
                          >
                            ›
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            disabled={!currentChunk || !ttsAllowed}
                            onClick={() =>
                              currentChunk && speak(currentChunk.content)
                            }
                            aria-label="Listen to page"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          {ttsAllowed && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={stop}
                              aria-label="Stop reading"
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <Textarea
                        value={currentChunk?.content ?? ""}
                        readOnly
                        className="min-h-[260px] text-sm"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-4 space-y-3">
                      <p className="font-medium">AI tools for this page</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!currentChunk || aiLoading}
                          onClick={() => runTool("summary")}
                        >
                          Summary
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!currentChunk || aiLoading}
                          onClick={() => runTool("explanation")}
                        >
                          Explanation
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!currentChunk || aiLoading}
                          onClick={() => runTool("questions")}
                        >
                          Questions
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!currentChunk || aiLoading}
                          onClick={() => runTool("notes")}
                        >
                          Study Notes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!currentChunk || aiLoading}
                          onClick={() => runTool("translate")}
                        >
                          Translate (Amharic)
                        </Button>
                      </div>
                      <Textarea
                        value={aiOutput}
                        readOnly
                        placeholder={
                          aiLoading
                            ? "AI is thinking..."
                            : "AI output will appear here."
                        }
                        className="min-h-[220px] text-sm"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

