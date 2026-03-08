"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  BookOpen, 
  Users, 
  Download, 
  TrendingUp,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Upload,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { UploadBookModal } from "@/components/upload-book-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabaseClient"
import type { Book, Category, Review } from "@/lib/mock-data"
import { mapDbBook, mapDbCategory, mapDbReview } from "@/lib/dataMappers"

const recentActivity = [
  { type: "book", action: "added", title: "Ethiopian Legal Framework", time: "2 hours ago" },
  { type: "user", action: "registered", title: "Abebe Kebede", time: "3 hours ago" },
  { type: "review", action: "submitted", title: "Review on History of Ethiopia", time: "5 hours ago" },
  { type: "download", action: "milestone", title: "10,000 downloads reached", time: "1 day ago" },
  { type: "book", action: "updated", title: "Modern Agriculture Guide", time: "1 day ago" },
]

const analyticsData = {
  dailyViews: [120, 145, 132, 167, 189, 210, 198],
  weeklyDownloads: [450, 520, 480, 610, 590, 720, 680],
  userGrowth: 12.5,
  downloadGrowth: 8.3,
  engagementGrowth: -2.1,
}

export default function AdminDashboard() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalDownloads: 0,
    totalCategories: 0,
    activeResearchers: 0,
    universitiesConnected: 0,
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const [checkingAccess, setCheckingAccess] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login?redirect=/admin")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (!profile || profile.role !== "admin") {
        router.push("/")
        return
      }

      setCheckingAccess(false)
    }

    checkAdmin()
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      const [
        { data: booksData },
        { data: categoriesData },
        { data: reviewsData },
        { data: statsRow },
      ] = await Promise.all([
        supabase.from("books").select("*"),
        supabase.from("categories").select("*"),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("platform_stats").select("*").eq("id", "main").maybeSingle(),
      ])

      setBooks((booksData ?? []).map(mapDbBook) as Book[])
      setCategories((categoriesData ?? []).map(mapDbCategory) as Category[])
      setReviews((reviewsData ?? []).map(mapDbReview) as Review[])

      if (statsRow) {
        setStats({
          totalBooks: statsRow.total_books,
          totalUsers: statsRow.total_users,
          totalDownloads: statsRow.total_downloads,
          totalCategories: statsRow.total_categories,
          activeResearchers: statsRow.active_researchers,
          universitiesConnected: statsRow.universities_connected,
        })
      }
    }

    if (!checkingAccess) {
      fetchData()
    }
  }, [checkingAccess])

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking admin access...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Manage books, users, and platform analytics
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button className="gap-2" onClick={() => setUploadModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Book
                </Button>
              </div>

              {/* Upload Book Modal */}
              <UploadBookModal
                open={uploadModalOpen}
                onOpenChange={setUploadModalOpen}
                onUpload={async (data) => {
                  const slugBase = data.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")
                  const slug = `${slugBase}-${Date.now()}`

                  const { error } = await supabase.from("books").insert({
                    title: data.title,
                    slug,
                    author: data.author,
                    description: data.description,
                    category_id: data.category,
                    language: data.language,
                    page_count: null,
                    published_year: null,
                    is_featured: false,
                  })

                  if (error) {
                    alert(`Failed to add book: ${error.message}`)
                    return
                  }

                  const { data: booksData } = await supabase.from("books").select("*")
                  setBooks((booksData ?? []).map(mapDbBook) as Book[])
                }}
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Books
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBooks.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-primary" />
                  <span className="text-primary">+23</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-primary" />
                  <span className="text-primary">+{analyticsData.userGrowth}%</span> growth
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Downloads
                </CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-primary" />
                  <span className="text-primary">+{analyticsData.downloadGrowth}%</span> this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Universities
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.universitiesConnected}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-primary" />
                  <span className="text-primary">+3</span> new partnerships
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Books Management */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="books" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="books" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Books
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Categories
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="books" className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search books..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead className="hidden sm:table-cell">Category</TableHead>
                          <TableHead className="hidden md:table-cell">Downloads</TableHead>
                          <TableHead className="hidden lg:table-cell">Rating</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBooks.map((book) => (
                          <TableRow key={book.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium line-clamp-1">{book.title}</p>
                                <p className="text-sm text-muted-foreground">{book.author}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="outline">{book.category}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {book.downloadCount.toLocaleString()}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{book.rating}</span>
                                <span className="text-muted-foreground text-sm">
                                  ({book.reviewCount})
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem asChild>
                                    <Link href={`/books/${book.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Reviews</CardTitle>
                      <CardDescription>
                        Moderate and manage user reviews
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {reviews.map((review) => {
                          const book = books.find((b) => b.id === review.bookId)
                          return (
                            <div
                              key={review.id}
                              className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{review.userName}</p>
                                  <Badge
                                    variant={
                                      review.sentiment === "positive"
                                        ? "default"
                                        : review.sentiment === "negative"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {review.sentiment}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  on {book?.title}
                                </p>
                                <p className="text-sm mt-2 line-clamp-2">{review.comment}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Approve</DropdownMenuItem>
                                  <DropdownMenuItem>Flag</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Categories</CardTitle>
                          <CardDescription>
                            Manage book categories and organization
                          </CardDescription>
                        </div>
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Category
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Amharic</TableHead>
                            <TableHead>Books</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categories.map((category) => (
                            <TableRow key={category.id}>
                              <TableCell className="font-medium">
                                {category.name}
                              </TableCell>
                              <TableCell>{category.nameAmharic}</TableCell>
                              <TableCell>{category.bookCount}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start gap-2"
                    onClick={() => setUploadModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add New Book
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Upload className="h-4 w-4" />
                    Bulk Upload
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          {activity.type === "book" && <BookOpen className="h-4 w-4" />}
                          {activity.type === "user" && <Users className="h-4 w-4" />}
                          {activity.type === "review" && <MessageSquare className="h-4 w-4" />}
                          {activity.type === "download" && <Download className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.action} - {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Services</span>
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      Demo Mode
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <span className="text-sm text-muted-foreground">45% used</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Requests</span>
                    <span className="text-sm text-muted-foreground">12.4k today</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
