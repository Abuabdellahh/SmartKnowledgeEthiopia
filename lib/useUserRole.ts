"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export type UserRole = "guest" | "student" | "teacher" | "admin"

export function useUserRole() {
  const [role, setRole] = useState<UserRole>("guest")
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setRole("guest")
        setEmail(null)
        setLoading(false)
        return
      }

      let metaRole = (user.user_metadata as any)?.role as string | undefined

      // If user has no role yet (e.g. first-time OAuth login), default to student
      if (!metaRole) {
        try {
          await supabase.auth.updateUser({ data: { role: "student" } })
          metaRole = "student"
        } catch {
          metaRole = "student"
        }
      }
      const normalized: UserRole =
        metaRole === "teacher"
          ? "teacher"
          : metaRole === "admin"
          ? "admin"
          : "student"

      setRole(normalized)
      setEmail(user.email ?? null)
      setLoading(false)
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  return { role, email, loading }
}

