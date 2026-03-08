import Link from "next/link"
import { Star, Download, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type Book } from "@/lib/mock-data"

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`}>
      <Card className="group h-full border-border bg-card hover:shadow-lg transition-all hover:-translate-y-1">
        <CardContent className="p-0">
          {/* Book Cover */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-muted">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <BookOpen className="h-16 w-16 text-primary/40" />
            </div>
            {book.isAvailableOffline && (
              <Badge 
                variant="secondary" 
                className="absolute right-2 top-2 gap-1 text-xs"
              >
                <Download className="h-3 w-3" />
                Offline
              </Badge>
            )}
          </div>
          
          {/* Book Info */}
          <div className="p-4">
            <div className="mb-2">
              <Badge variant="outline" className="text-xs">
                {book.category}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {book.author}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-secondary text-secondary" />
                <span className="text-sm font-medium">{book.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({book.reviewCount})
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {book.language}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
