"use client"

import { useState, useEffect } from "react"
import { Upload, BookOpen, Sparkles } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CategoryCard } from "@/components/category-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import type { Category } from "@/lib/mock-data"
import { supabase } from "@/lib/supabaseClient"
import { mapDbCategory } from "@/lib/dataMappers"

export default function BooksPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email ?? null)
      
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("book_count", { ascending: false })

      setCategories((categoriesData ?? []).map(mapDbCategory) as Category[])
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              Personal Knowledge Library
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Build Your Learning Library
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your books, organize by categories, and access them anywhere with AI-powered reading tools.
            </p>
            
            {userEmail ? (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/upload">
                    <Upload className="h-5 w-5" />
                    Upload Your First Book
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link href="/library">
                    <BookOpen className="h-5 w-5" />
                    Go to My Library
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-8">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/signup">
                    Get Started Free
                  </Link>
                </Button>
                <p className="mt-3 text-sm text-muted-foreground">
                  Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Upload Books</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload TXT or PDF files from your device. Your books are stored securely in your personal library.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Read & Learn</h3>
                  <p className="text-sm text-muted-foreground">
                    Access your books anytime with our clean reader interface and AI-powered study tools.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">3. AI Assistance</h3>
                  <p className="text-sm text-muted-foreground">
                    Get summaries, explanations, quizzes, and flashcards generated instantly by AI.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Organize by Category</h2>
              <p className="mt-2 text-muted-foreground">
                Keep your books organized across different subjects
              </p>
            </div>
            {loading ? (
              <div className="text-center text-muted-foreground">Loading categories...</div>
            ) : categories.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>No categories available yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        {!userEmail && (
          <section className="py-16 border-t border-border">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join Smart Knowledge Ethiopia and build your personal digital library today.
              </p>
              <Button asChild size="lg">
                <Link href="/signup">Create Free Account</Link>
              </Button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
