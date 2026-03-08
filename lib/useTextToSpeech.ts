"use client"

import { useUserRole } from "@/lib/useUserRole"

export function useTextToSpeech() {
  const { role } = useUserRole()
  const allowed = role === "student" || role === "teacher" || role === "admin"

  const speak = (text: string) => {
    if (!allowed) return
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    window.speechSynthesis.speak(utterance)
  }

  const stop = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
  }

  return { speak, stop, allowed }
}

