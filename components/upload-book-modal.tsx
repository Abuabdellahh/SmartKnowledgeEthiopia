"use client"

import { useState, useCallback, useEffect } from "react"
import { X, Upload, FileText, Image, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/mock-data"
import { supabase } from "@/lib/supabaseClient"

interface UploadBookModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload?: (bookData: BookFormData) => void
}

interface BookFormData {
  title: string
  author: string
  description: string
  category: string
  language: string
  coverFile?: File
  pdfFile?: File
}

export function UploadBookModal({ open, onOpenChange, onUpload }: UploadBookModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [step, setStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    description: "",
    category: "",
    language: "en"
  })
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*").order("name")
      setCategories((data ?? []) as Category[])
    }
    fetchCategories()
  }, [])

  const handleCoverDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      setFormData(prev => ({ ...prev, coverFile: file }))
      setCoverPreview(URL.createObjectURL(file))
    }
  }, [])

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, coverFile: file }))
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setFormData(prev => ({ ...prev, pdfFile: file }))
      setPdfName(file.name)
    }
  }

  const handleSubmit = async () => {
    setIsUploading(true)
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    onUpload?.(formData)
    setIsUploading(false)
    onOpenChange(false)
    // Reset form
    setStep(1)
    setFormData({ title: "", author: "", description: "", category: "", language: "en" })
    setCoverPreview(null)
    setPdfName(null)
  }

  const isStep1Valid = formData.title && formData.author && formData.category
  const isStep2Valid = formData.pdfFile

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload New Book</DialogTitle>
          <DialogDescription>
            Add a new book to the Smart Knowledge Ethiopia library
          </DialogDescription>
        </DialogHeader>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                step >= s 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "h-0.5 w-12 mx-2",
                  step > s ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Book Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter book title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Author *</label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Enter author name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter book description"
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select 
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <Select 
                  value={formData.language}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="am">Amharic</SelectItem>
                    <SelectItem value="or">Oromiffa</SelectItem>
                    <SelectItem value="ti">Tigrinya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Upload Files */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image</label>
              <div
                onDrop={handleCoverDrop}
                onDragOver={(e) => e.preventDefault()}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
                  coverPreview ? "border-primary" : "border-border hover:border-primary/50"
                )}
              >
                {coverPreview ? (
                  <div className="relative">
                    <img 
                      src={coverPreview} 
                      alt="Cover preview" 
                      className="h-40 w-auto rounded-lg object-cover"
                    />
                    <button
                      onClick={() => { setCoverPreview(null); setFormData(prev => ({ ...prev, coverFile: undefined })) }}
                      className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Image className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drag and drop or click to upload
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverSelect}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </>
                )}
              </div>
            </div>

            {/* PDF File */}
            <div className="space-y-2">
              <label className="text-sm font-medium">PDF File *</label>
              <div className={cn(
                "relative flex items-center gap-4 rounded-lg border-2 border-dashed p-4 transition-colors",
                pdfName ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}>
                <FileText className={cn("h-10 w-10", pdfName ? "text-primary" : "text-muted-foreground")} />
                <div className="flex-1">
                  {pdfName ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{pdfName}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click to upload PDF file
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfSelect}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h4 className="font-medium text-foreground">Review Book Details</h4>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex">
                  <dt className="w-24 text-muted-foreground">Title:</dt>
                  <dd className="font-medium">{formData.title}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-muted-foreground">Author:</dt>
                  <dd>{formData.author}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-muted-foreground">Category:</dt>
                  <dd>{categories.find(c => c.id === formData.category)?.name}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-muted-foreground">Language:</dt>
                  <dd>{formData.language === "en" ? "English" : formData.language === "am" ? "Amharic" : formData.language}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-muted-foreground">PDF:</dt>
                  <dd className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-primary" />
                    {pdfName}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-secondary/10 p-3">
              <AlertCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                The book will be processed and AI summaries will be generated automatically. 
                This may take a few minutes.
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Button 
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Book"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
