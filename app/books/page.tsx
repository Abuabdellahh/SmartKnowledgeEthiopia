"use client"

import { useState, useMemo, useEffect } from "react"
import { Filter, Grid, List, X, Sparkles } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BookCard } from "@/components/book-card"
import { CategoryCard } from "@/components/category-card"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Book, Category } from "@/lib/mock-data"
import { supabase } from "@/lib/supabaseClient"
import { mapDbBook, mapDbCategory } from "@/lib/dataMappers"

type SortOption = "rating" | "newest" | "popular" | "title"
type ViewMode = "grid" | "list" | "categories"

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("rating")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [{ data: booksData }, { data: categoriesData }] = await Promise.all([
        supabase.from("books").select("*"),
        supabase.from("categories").select("*"),
      ])

      setBooks((booksData ?? []).map(mapDbBook) as Book[])
      setCategories((categoriesData ?? []).map(mapDbCategory) as Category[])
      setLoading(false)
    }

    fetchData()
  }, [])

  const languages = useMemo(() => {
    return Array.from(new Set(books.map((book) => book.language)))
  }, [books])

  const filteredBooks = useMemo(() => {
    let result = [...books]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.description.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((book) => book.category === selectedCategory)
    }

    // Language filter
    if (selectedLanguage) {
      result = result.filter((book) => book.language === selectedLanguage)
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        result.sort((a, b) => b.publishedYear - a.publishedYear)
        break
      case "popular":
        result.sort((a, b) => b.downloadCount - a.downloadCount)
        break
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return result
  }, [books, searchQuery, selectedCategory, selectedLanguage, sortBy])

  const activeFilters = [
    selectedCategory && { type: "category", value: selectedCategory },
    selectedLanguage && { type: "language", value: selectedLanguage },
  ].filter(Boolean) as { type: string; value: string }[]

  const clearFilter = (type: string) => {
    if (type === "category") setSelectedCategory(null)
    if (type === "language") setSelectedLanguage(null)
  }

  const clearAllFilters = () => {
    setSelectedCategory(null)
    setSelectedLanguage(null)
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Browse Library
            </h1>
            <p className="mt-2 text-muted-foreground">
              Explore our collection of {books.length.toLocaleString()}+ books and resources
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <SearchBar
                  placeholder="Search books, authors..."
                  onSearch={setSearchQuery}
                  showSuggestions={false}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="hidden sm:flex items-center border border-border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>

                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="sm:hidden">
                      <Filter className="h-4 w-4" />
                      <span className="sr-only">Filters</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>
                        Filter books by category and language
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Category</h4>
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <Button
                              key={category.id}
                              variant={selectedCategory === category.name ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => setSelectedCategory(
                                selectedCategory === category.name ? null : category.name
                              )}
                            >
                              {category.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-3">Language</h4>
                        <div className="space-y-2">
                          {languages.map((language) => (
                            <Button
                              key={language}
                              variant={selectedLanguage === language ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => setSelectedLanguage(
                                selectedLanguage === language ? null : language
                              )}
                            >
                              {language}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Filters:</span>
                {activeFilters.map((filter) => (
                  <Badge
                    key={`${filter.type}-${filter.value}`}
                    variant="secondary"
                    className="gap-1"
                  >
                    {filter.value}
                    <button
                      onClick={() => clearFilter(filter.type)}
                      className="ml-1 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              {/* Desktop Sidebar */}
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Categories</h4>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.name ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-between"
                          onClick={() => setSelectedCategory(
                            selectedCategory === category.name ? null : category.name
                          )}
                        >
                          <span>{category.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {category.bookCount}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Language</h4>
                    <div className="space-y-1">
                      {languages.map((language) => (
                        <Button
                          key={language}
                          variant={selectedLanguage === language ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSelectedLanguage(
                            selectedLanguage === language ? null : language
                          )}
                        >
                          {language}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1">
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">
                    Loading books...
                  </div>
                ) : viewMode === "categories" ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                  </div>
                ) : filteredBooks.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No books found matching your criteria.</p>
                    <Button variant="outline" onClick={clearAllFilters} className="mt-4">
                      Clear filters
                    </Button>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBooks.map((book) => (
                      <BookListItem key={book.id} book={book} />
                    ))}
                  </div>
                )}

                {/* Results count */}
                {!loading && filteredBooks.length > 0 && (
                  <p className="mt-8 text-center text-sm text-muted-foreground">
                    Showing {filteredBooks.length} of {books.length} books
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

import Link from "next/link"
import { Star, Download, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { type Book } from "@/lib/mock-data"

function BookListItem({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}`}>
      <Card className="group border-border bg-card hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Cover */}
            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <BookOpen className="h-8 w-8 text-primary/40" />
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="text-xs mb-2">
                    {book.category}
                  </Badge>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span className="text-sm font-medium">{book.rating}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {book.description}
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span>{book.language}</span>
                <span>{book.pages} pages</span>
                <span>{book.publishedYear}</span>
                {book.isAvailableOffline && (
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Offline
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
