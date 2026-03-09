"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX, Pause, Play, SkipForward, SkipBack } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useTextToSpeech } from "@/lib/useTextToSpeech"
import { useUserRole } from "@/lib/useUserRole"
import { Badge } from "@/components/ui/badge"

interface VoiceReaderProps {
  text: string
  title?: string
}

export function VoiceReader({ text, title }: VoiceReaderProps) {
  const { role } = useUserRole()
  const { speak, stop, allowed } = useTextToSpeech()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [rate, setRate] = useState(1.0)
  const [currentPosition, setCurrentPosition] = useState(0)

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handlePlay = () => {
    if (!allowed || !text) return

    if (isPaused) {
      // Resume
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.resume()
      }
      setIsPaused(false)
      setIsPlaying(true)
    } else {
      // Start new
      stop()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.lang = "en-US"
      
      utterance.onstart = () => {
        setIsPlaying(true)
        setIsPaused(false)
      }
      
      utterance.onend = () => {
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentPosition(0)
      }
      
      utterance.onerror = () => {
        setIsPlaying(false)
        setIsPaused(false)
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  const handlePause = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause()
    }
    setIsPaused(true)
    setIsPlaying(false)
  }

  const handleStop = () => {
    stop()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentPosition(0)
  }

  const handleRateChange = (value: number[]) => {
    const newRate = value[0]
    setRate(newRate)
    
    // If currently playing, restart with new rate
    if (isPlaying) {
      handleStop()
      setTimeout(() => handlePlay(), 100)
    }
  }

  if (!allowed) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">Voice Reading</h3>
              <p className="text-xs text-muted-foreground">
                Available for Students, Teachers, and Admins
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {role === "guest" ? "Sign in" : "Upgrade"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium text-sm">Voice Reading</h3>
                {title && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{title}</p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {role}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              className="h-8 w-8"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {isPlaying ? (
              <Button
                size="icon"
                onClick={handlePause}
                className="h-10 w-10"
              >
                <Pause className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handlePlay}
                className="h-10 w-10"
              >
                <Play className="h-5 w-5" />
              </Button>
            )}

            <Button
              size="icon"
              variant="outline"
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              className="h-8 w-8"
            >
              {isPlaying || isPaused ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <SkipForward className="h-4 w-4" />
              )}
            </Button>

            <div className="flex-1 ml-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Speed</span>
                <span>{rate.toFixed(1)}x</span>
              </div>
              <Slider
                value={[rate]}
                onValueChange={handleRateChange}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {(isPlaying || isPaused) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${currentPosition}%` }}
                />
              </div>
              <span>{isPaused ? "Paused" : "Playing"}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
