"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Download, ExternalLink } from "lucide-react"

interface PDFViewerProps {
  fileUrl: string
  title: string
  onPageTextExtracted?: (text: string) => void
}

export function PDFViewer({ fileUrl, title }: PDFViewerProps) {
  const [scale, setScale] = useState<number>(100)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(s => Math.max(50, s - 10))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{scale}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(s => Math.min(200, s + 10))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={fileUrl} download={title} title="Download PDF">
              <Download className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-muted/20">
        <iframe
          src={`${fileUrl}#zoom=${scale}`}
          className="w-full h-full border-0"
          title={title}
        />
      </div>
    </div>
  )
}
