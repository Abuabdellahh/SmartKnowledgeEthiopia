import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Code } from "lucide-react"

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">API Access</h1>
            <p className="text-xl text-muted-foreground">
              Integrate Smart Knowledge Ethiopia into your applications.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-8 text-center">
                <Code className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-3">API Coming Soon</h2>
                <p className="text-muted-foreground mb-4">
                  We're working on providing API access for developers and institutions.
                </p>
                <p className="text-sm text-muted-foreground">
                  Contact us at <a href="mailto:api@smartknowledge.et" className="text-primary hover:underline">api@smartknowledge.et</a> for early access.
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
