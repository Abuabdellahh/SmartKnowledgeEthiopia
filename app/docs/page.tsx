import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, MessageSquare, Upload, Search } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Learn how to use Smart Knowledge Ethiopia effectively.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <BookOpen className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Reading Books</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Browse our library, select a book, and start reading. Use arrow keys to navigate pages.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <MessageSquare className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI Chat</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ask questions about any topic. Our AI provides answers based on reliable academic sources.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Upload className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Uploading Content</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload your own books in TXT format. PDFs should be converted to text first.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Search className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use semantic search to find books by meaning, not just keywords.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
