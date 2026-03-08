"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "student" },
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess("Account created. Check your email to confirm, then sign in.")
    router.push("/login")
  }

  const handleGoogleSignUp = async () => {
    setError("")
    setSuccess("")
    setLoading(true)

    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/`
        : undefined

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (error) {
      const anyErr = error as any
      if (
        anyErr?.error_code === "validation_failed" ||
        error.message.toLowerCase().includes("provider is not enabled")
      ) {
        setError("Google sign in is not configured. Please use email/password or contact the administrator.")
      } else {
        setError(error.message)
      }
      setLoading(false)
    }
    // After redirect back, useUserRole will assign role=student if missing
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-6 space-y-4">
          <h1 className="text-xl font-semibold">Log in or sign up</h1>
          <p className="text-sm text-muted-foreground">
            You&apos;ll get smarter responses and can upload books, documents, and more.
          </p>

          {/* OAuth providers */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm justify-start gap-2"
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-background">
                <span className="text-lg leading-none">G</span>
              </span>
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm justify-start gap-2"
              onClick={() => setError("Apple sign in is not available yet.")}
              disabled={loading}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-background">
                <span className="text-lg leading-none"></span>
              </span>
              Continue with Apple
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm justify-start gap-2"
              onClick={() => setError("Phone sign in is not available yet.")}
              disabled={loading}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-background">
                <span className="text-base leading-none">📞</span>
              </span>
              Continue with phone
            </Button>
          </div>

          <div className="relative py-2 text-xs text-muted-foreground text-center">
            <span className="bg-background px-2 relative z-10">OR</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          </div>

          {/* Email/password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Sign up"}
            </Button>
          </form>
          <div className="relative py-2 text-xs text-muted-foreground text-center">
            <span className="bg-background px-2 relative z-10">or continue with</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full text-sm"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            Continue with Google
          </Button>
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

