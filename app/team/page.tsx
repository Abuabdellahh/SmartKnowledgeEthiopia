import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function TeamPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Our Team</h1>
            <p className="text-xl text-muted-foreground">
              Meet the passionate individuals building Smart Knowledge Ethiopia.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Team information coming soon. We're a dedicated group of educators, developers, and AI specialists committed to transforming education in Ethiopia.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
