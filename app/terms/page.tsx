import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
                  <p className="text-muted-foreground">
                    By accessing Smart Knowledge Ethiopia, you agree to these terms of service and our privacy policy.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">User Responsibilities</h2>
                  <p className="text-muted-foreground">
                    Users must use the platform for educational purposes only and respect intellectual property rights of content creators.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Content Usage</h2>
                  <p className="text-muted-foreground">
                    All content is provided for educational purposes. Redistribution or commercial use without permission is prohibited.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Account Termination</h2>
                  <p className="text-muted-foreground">
                    We reserve the right to terminate accounts that violate these terms or engage in harmful activities.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
