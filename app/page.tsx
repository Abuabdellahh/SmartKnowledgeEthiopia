import Link from "next/link"
import { 
  BookOpen, 
  MessageSquare, 
  Users, 
  Download, 
  GraduationCap,
  ArrowRight,
  Sparkles,
  Globe,
  Zap,
  Search
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookCard } from "@/components/book-card"
import { CategoryCard } from "@/components/category-card"
import { supabase } from "@/lib/supabaseClient"
import type { Book, Category } from "@/lib/mock-data"
import { mapDbBook, mapDbCategory } from "@/lib/dataMappers"

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Summaries",
    description: "Get instant summaries of any book using advanced AI. Understand key concepts in minutes."
  },
  {
    icon: MessageSquare,
    title: "Ask Questions",
    description: "Chat with our AI about any book or topic. Get answers based on reliable academic sources."
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find exactly what you need with intelligent search that understands meaning, not just keywords."
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Access content in Amharic, English, and other Ethiopian languages."
  },
  {
    icon: Download,
    title: "Offline Access",
    description: "Download books and resources to study anywhere, even without internet connection."
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Optimized for Ethiopian internet conditions with fast loading and low data usage."
  }
]

async function getHomeData() {
  const [{ data: books }, { data: categories }, { data: statsRow }] =
    await Promise.all([
      supabase
        .from("books")
        .select("*")
        .order("download_count", { ascending: false })
        .limit(4),
      supabase
        .from("categories")
        .select("*")
        .order("book_count", { ascending: false })
        .limit(4),
      supabase.from("platform_stats").select("*").eq("id", "main").maybeSingle(),
    ])

  const featuredBooks = (books ?? []).map(mapDbBook) as Book[]
  const topCategories = (categories ?? []).map(mapDbCategory) as Category[]

  const stats = statsRow
    ? {
        totalBooks: statsRow.total_books,
        totalUsers: statsRow.total_users,
        totalDownloads: statsRow.total_downloads,
        totalCategories: statsRow.total_categories,
        activeResearchers: statsRow.active_researchers,
        universitiesConnected: statsRow.universities_connected,
      }
    : {
        totalBooks: 0,
        totalUsers: 0,
        totalDownloads: 0,
        totalCategories: 0,
        activeResearchers: 0,
        universitiesConnected: 0,
      }

  return { featuredBooks, topCategories, stats }
}

export default async function HomePage() {
  const { featuredBooks, topCategories, stats } = await getHomeData()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI-Powered Learning Platform
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                Smart Knowledge for{" "}
                <span className="text-primary">Ethiopian Learners</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed sm:text-xl text-pretty">
                Access thousands of books, research materials, and AI-assisted learning tools. 
                Designed specifically for Ethiopian students, researchers, and lifelong learners.
              </p>
              
              {/* Large Semantic Search Bar */}
              <div className="mt-10 max-w-2xl mx-auto">
                <SearchBar 
                  size="large" 
                  placeholder="Search books, topics, or ask the AI anything..."
                  showSuggestions
                />
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/books">
                    <BookOpen className="h-5 w-5" />
                    Explore Platform
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link href="/chat">
                    <MessageSquare className="h-5 w-5" />
                    Try AI Chat
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">
                  {stats.totalBooks.toLocaleString()}+
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Books Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">
                  {stats.totalUsers.toLocaleString()}+
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">
                  {stats.universitiesConnected}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Universities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">
                  {stats.totalDownloads.toLocaleString()}+
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Downloads</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Learn Smarter with AI
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful features designed to enhance your learning experience
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card key={feature.title} className="border-border bg-card hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="border-t border-border bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Browse by Category
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Explore our collection across various subjects
                </p>
              </div>
              <Button asChild variant="ghost" className="hidden sm:flex gap-2">
                <Link href="/books?view=categories">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Button asChild variant="outline" className="gap-2">
                <Link href="/books?view=categories">
                  View All Categories
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Books Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Featured Books
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Popular and highly-rated books from our collection
                </p>
              </div>
              <Button asChild variant="ghost" className="hidden sm:flex gap-2">
                <Link href="/library">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Button asChild variant="outline" className="gap-2">
                <Link href="/library">
                  View All Books
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-primary">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-primary-foreground/80" />
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Start Learning Today
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Join thousands of Ethiopian students and researchers who are already using 
                Smart Knowledge Ethiopia to accelerate their learning.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  variant="secondary"
                  className="gap-2"
                >
                  <Link href="/signup">
                    <Users className="h-5 w-5" />
                    Create Free Account
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="gap-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
