import Link from "next/link"
import { 
  ArrowLeft, 
  Download, 
  BookOpen, 
  Share2, 
  Heart,
  Sparkles,
  Clock,
  FileText,
  Globe,
  Calendar
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { RatingStars } from "@/components/rating-stars"
import { ReviewForm } from "@/components/review-form"
import { AIResponseCard } from "@/components/ai-response-card"
import { ChatWindow } from "@/components/chat-window"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Book, Review } from "@/lib/mock-data"
import { supabase } from "@/lib/supabaseClient"
import { mapDbBook, mapDbReview } from "@/lib/dataMappers"
import { BookDetailClient } from "./BookDetailClient"

interface BookDetailPageProps {
  params: { id: string }
}

async function getBookData(id: string) {
  const [{ data: book }, { data: bookReviews }] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("reviews")
      .select("*")
      .eq("book_id", id)
      .order("created_at", { ascending: false }),
  ])

  return {
    book: book ? (mapDbBook(book) as Book) : null,
    bookReviews: (bookReviews ?? []).map(mapDbReview) as Review[],
  }
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = params
  const { book, bookReviews } = await getBookData(id)

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Book not found</h1>
            <p className="mt-2 text-muted-foreground">
              The book you are looking for does not exist.
            </p>
            <Button asChild className="mt-4">
              <Link href="/books">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <BookDetailClient book={book} bookReviews={bookReviews} />
  )
}
