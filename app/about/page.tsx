import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Heart, Users, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Our Mission</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Empowering Ethiopian students and researchers with AI-powered access to knowledge and learning resources.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <Target className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Our Vision</h3>
                  <p className="text-sm text-muted-foreground">
                    To become the leading AI-powered educational platform in Ethiopia, democratizing access to quality learning resources for all.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Heart className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Our Values</h3>
                  <p className="text-sm text-muted-foreground">
                    Accessibility, innovation, and excellence in education. We believe knowledge should be available to everyone, everywhere.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Community First</h3>
                  <p className="text-sm text-muted-foreground">
                    Built by Ethiopians, for Ethiopians. We understand the unique challenges and opportunities in our education system.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Zap className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">
                    Leveraging cutting-edge AI technology to provide personalized learning experiences and instant knowledge access.
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
