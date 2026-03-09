import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">Data Collection</h2>
                  <p className="text-muted-foreground">
                    We collect minimal personal information necessary to provide our services, including email addresses and usage data to improve your learning experience.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Data Usage</h2>
                  <p className="text-muted-foreground">
                    Your data is used solely to enhance your educational experience. We never sell or share your personal information with third parties.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Security</h2>
                  <p className="text-muted-foreground">
                    We implement industry-standard security measures to protect your data, including encryption and secure authentication.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
                  <p className="text-muted-foreground">
                    You have the right to access, modify, or delete your personal data at any time. Contact us for assistance.
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
