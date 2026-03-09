import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Search, FileText, Database, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ResearchersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">For Researchers</h1>
            <p className="text-xl text-muted-foreground">
              Advanced tools and resources for academic research.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card>
                <CardContent className="p-6">
                  <Search className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Semantic search across thousands of academic papers and books to find relevant research.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <FileText className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI Summarization</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant summaries of research papers to quickly assess relevance to your work.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Database className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Research Repository</h3>
                  <p className="text-sm text-muted-foreground">
                    Access a growing collection of Ethiopian and international research materials.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Share2 className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Collaboration Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Share findings and collaborate with other researchers in your field.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold mb-3">Join Our Research Community</h2>
                <p className="mb-6 opacity-90">
                  Connect with fellow researchers and access cutting-edge AI tools for your work.
                </p>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/signup">Create Account</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
