import { Suspense } from "react"
import { ChatClient } from "./ChatClient"

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ChatClient />
    </Suspense>
  )
}
