"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RatingStars } from "@/components/rating-stars"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  bookId: string
  onSubmit?: (review: { rating: number; content: string }) => void
  className?: string
}

export function ReviewForm({ bookId, onSubmit, className }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    if (content.trim().length < 10) {
      setError("Review must be at least 10 characters")
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onSubmit?.({ rating, content })
    setRating(0)
    setContent("")
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div>
        <label className="text-sm font-medium text-foreground">
          Your Rating
        </label>
        <div className="mt-2">
          <RatingStars
            rating={rating}
            size="lg"
            interactive
            onRatingChange={setRating}
          />
        </div>
      </div>

      <div>
        <label htmlFor="review-content" className="text-sm font-medium text-foreground">
          Your Review
        </label>
        <Textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about this book..."
          className="mt-2 min-h-[120px] resize-none"
          maxLength={1000}
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{content.length}/1000 characters</span>
          {content.length > 0 && content.length < 10 && (
            <span className="text-destructive">Minimum 10 characters</span>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  )
}
