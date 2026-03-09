"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  BookOpen, 
  MessageSquare, 
  Volume2,
  FileText,
  BarChart3,
  Sparkles,
  Download
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"
import { useUserRole } from "@/lib/useUserRole"
import { BookCard } from "@/components/book-card"
import { mapDbBook } from "@/lib/dataMappers"
import type { Book } from "@/lib/mock-data"

export default function DashboardPage() {
  const router = useRouter()
  const { role, email, loading } = useUserRole()
  const [recentBooks, setRecentBooks] = useState<Book[]>([])
  const [stats, setStats] = useState({
    booksRead: 12,
    aiQueriesUsed: 45,
    voiceMinutes: 120,
    notesCreated: 8
  })

  useEffect(() => {
    if (!loading && role === "guest") {
      router.push("/login")
    }
  }, [loading, role, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: booksData } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4)

      if (booksData) {
        setRecentBooks(booksData.map(mapDbBook) as Book[])
      }
    }

    if (!loading && role !== "guest") {
      fetchDashboardData()
    }
  }, [loading, role])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  const roleConfig = {
    guest: { title: "Guest", color: "bg-gray-500" },
    student: { title: "Student", color: "bg-blue-500" },
    teacher: { title: "Teacher", color: "bg-purple-500" },
    admin: { title: "Admin", color: "bg-red-500" }
  }

  const currentRole = roleConfig[role]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Welcome back!
                  </h1>
                  <Badge className={`${currentRole.color} text-white`}>
                    {currentRole.title}
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{email}</p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/books">
                    <BookOpen className="h-4 w-4" />
                    Browse Books
                  </Link>
                </Button>
                <Button asChild className="gap-2">
                  <Link href="/chat">
                    <MessageSquare className="h-4 w-4" />
                    AI Chat
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Books Read
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.booksRead}</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  AI Queries
                </CardTitle>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.aiQueriesUsed}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {role === "guest" ? "Upgrade to use" : "Used this week"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Voice Reading
                </CardTitle>
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.voiceMinutes}m</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {role === "guest" ? "Upgrade to use" : "Total minutes"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Notes Created
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.notesCreated}</div>
                <p className="text-xs text-muted-foreground mt-1">Active notes</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Your Features</CardTitle>
                <CardDescription>
                  Available tools based on your {currentRole.title} role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Browse Books</h3>
                      <p className="text-sm text-muted-foreground">Access our full library</p>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                    role === "guest" ? "border-border opacity-50" : "border-border"
                  }`}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">AI Chat</h3>
                      <p className="text-sm text-muted-foreground">
                        {role === "guest" ? "Students+ only" : "Ask AI anything"}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                    role === "guest" ? "border-border opacity-50" : "border-border"
                  }`}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Volume2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Voice Reading</h3>
                      <p className="text-sm text-muted-foreground">
                        {role === "guest" ? "Students+ only" : "Listen to books"}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                    role === "guest" ? "border-border opacity-50" : "border-border"
                  }`}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">AI Summaries</h3>
                      <p className="text-sm text-muted-foreground">
                        {role === "guest" ? "Students+ only" : "Get instant summaries"}
                      </p>
                    </div>
                  </div>

                  {(role === "teacher" || role === "admin") && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Analytics</h3>
                        <p className="text-sm text-muted-foreground">View usage statistics</p>
                      </div>
                    </div>
                  )}

                  {role === "admin" && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Download className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Admin Panel</h3>
                        <p className="text-sm text-muted-foreground">Manage platform</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href="/books">
                    <BookOpen className="h-4 w-4" />
                    Browse Library
                  </Link>
                </Button>
                {role !== "guest" && (
                  <>
                    <Button asChild variant="outline" className="justify-start gap-2">
                      <Link href="/chat">
                        <MessageSquare className="h-4 w-4" />
                        AI Chat
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start gap-2">
                      <Link href="/reading">
                        <Volume2 className="h-4 w-4" />
                        Voice Reading
                      </Link>
                    </Button>
                  </>
                )}
                {role === "admin" && (
                  <Button asChild variant="outline" className="justify-start gap-2">
                    <Link href="/admin">
                      <BarChart3 className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Recent Books
                </h2>
                <p className="text-muted-foreground">Latest additions to our library</p>
              </div>
              <Button asChild variant="ghost" className="gap-2">
                <Link href="/books">View All</Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
