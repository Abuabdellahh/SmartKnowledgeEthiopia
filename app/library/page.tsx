"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, Plus, Trash2, Eye, Upload, Search, Grid3x3, List, Clock, BookMarked, Pencil, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { EditBookDialog } from "@/components/edit-book-dialog"
import { supabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

interface Book {
  id: string
  title: string
  author: string
  description?: string
  cover_url?: string
  file_url: string
  created_at: string
}

export default function LibraryPage() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)
  const BOOKS_PER_PAGE = 12

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/library')
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const from = (currentPage - 1) * BOOKS_PER_PAGE
        const to = from + BOOKS_PER_PAGE - 1

        const { data, count, error } = await supabase
          .from("books")
          .select("*", { count: 'exact' })
          .order("created_at", { ascending: false })
          .range(from, to)

        if (error) {
          console.error('Error fetching books:', error)
          setLoadingBooks(false)
          return
        }

        if (data) {
          setBooks(data)
          setFilteredBooks(data)
        }
        if (count !== null) {
          setTotalBooks(count)
        }
        setLoadingBooks(false)
      } catch (err) {
        console.error('Fetch error:', err)
        setLoadingBooks(false)
      }
    }

    fetchBooks()
  }, [currentPage])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(books)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredBooks(
        books.filter(
          (book) =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, books])

  const handleDelete = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) return
    const { error } = await supabase.from("books").delete().eq("id", bookId)
    if (!error) {
      setBooks(books.filter(b => b.id !== bookId))
      setFilteredBooks(filteredBooks.filter(b => b.id !== bookId))
    }
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setEditDialogOpen(true)
  }

  const handleEditSuccess = async () => {
    // Refresh current page
    const from = (currentPage - 1) * BOOKS_PER_PAGE
    const to = from + BOOKS_PER_PAGE - 1
    
    const { data } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to)
    
    if (data) {
      setBooks(data)
      setFilteredBooks(data)
    }
  }

  const totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        {/* Header Section */}
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">My Library</h1>
                  <p className="text-muted-foreground">Your personal book collection</p>
                  {!loadingBooks && (
                    <div className="flex items-center gap-4 mt-3">
                      <Badge variant="secondary" className="gap-1.5">
                        <BookMarked className="h-3.5 w-3.5" />
                        {totalBooks} {totalBooks === 1 ? "Book" : "Books"}
                      </Badge>
                      {totalPages > 1 && (
                        <Badge variant="outline" className="gap-1.5">
                          Page {currentPage} of {totalPages}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/upload">
                    <Plus className="h-5 w-5" />
                    Upload Book
                  </Link>
                </Button>
              </div>

              {/* Search and Filters */}
              {!loadingBooks && books.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title or author..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className={cn(viewMode === "grid" && "bg-muted")}
                      title="Grid view"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className={cn(viewMode === "list" && "bg-muted")}
                      title="List view"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {loadingBooks ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-[3/4] rounded-t-lg" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : books.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="mx-auto w-fit p-4 rounded-full bg-primary/10 mb-4">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No books yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Start building your personal library by uploading your first book
                </p>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/upload">
                    <Plus className="h-5 w-5" />
                    Upload Your First Book
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : filteredBooks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="mx-auto w-fit p-4 rounded-full bg-muted mb-4">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No books found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search terms
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="group overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 flex items-center justify-center relative overflow-hidden">
                    {book.cover_url ? (
                      <img 
                        src={book.cover_url} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-20 w-20 text-primary/30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">{book.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-1">{book.author}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                      <Clock className="h-3 w-3" />
                      {new Date(book.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="default" size="sm" className="flex-1 gap-1.5">
                        <Link href={`/book/${book.id}`}>
                          <Eye className="h-4 w-4" />
                          Read
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(book)}
                        title="Edit book"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(book.id)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        title="Delete book"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {book.cover_url ? (
                          <img 
                            src={book.cover_url} 
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-8 w-8 text-primary/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(book.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button asChild variant="default" size="sm" className="gap-1.5">
                          <Link href={`/book/${book.id}`}>
                            <Eye className="h-4 w-4" />
                            Read
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(book)}
                          title="Edit book"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(book.id)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          title="Delete book"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loadingBooks && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-9"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </main>

      <EditBookDialog
        book={editingBook}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />

      <Footer />
    </div>
  )
}
