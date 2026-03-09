import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Users, BookOpen, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UniversitiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">For Universities</h1>
            <p className="text-xl text-muted-foreground">
              Empower your institution with AI-powered learning resources.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card>
                <CardContent className="p-6">
                  <GraduationCap className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Institutional Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide unlimited access to thousands of books and resources for all your students.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Bulk Licensing</h3>
                  <p className="text-sm text-muted-foreground">
                    Special pricing for educational institutions with flexible licensing options.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <BookOpen className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Custom Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage your institution's own educational materials securely.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Zap className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Track usage, engagement, and learning outcomes across your institution.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold mb-3">Interested in Partnership?</h2>
                <p className="mb-6 opacity-90">
                  Contact us to discuss how we can support your institution's educational goals.
                </p>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/contact">Get in Touch</Link>
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
