"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabaseClient"

export default function UploadPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setCoverPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setError("")
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Upload file to storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('user-books')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error(`Storage error: ${uploadError.message}`)
      }

      // Upload cover image if provided
      let coverUrl = null
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop()
        const coverPath = `covers/${user.id}/${Date.now()}.${coverExt}`
        const { error: coverError } = await supabase.storage
          .from('book-covers')
          .upload(coverPath, coverFile)
        
        if (!coverError) {
          const { data: { publicUrl } } = supabase.storage
            .from('book-covers')
            .getPublicUrl(coverPath)
          coverUrl = publicUrl
        } else {
          console.warn('Cover upload failed:', coverError)
        }
      }

      // Get first category (optional)
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .limit(1)
        .single()

      // Create book record
      const { data: bookData, error: dbError } = await supabase.from('books').insert({
        title,
        slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        author,
        description: description || null,
        cover_url: coverUrl,
        category_id: cat?.id || null,
        file_url: filePath,
        language: 'en'
      }).select().single()

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error(`Database error: ${dbError.message}`)
      }

      // Read file content for pages
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      let text = ''
      
      if (file.type === 'text/plain' || fileExt === 'txt') {
        // TXT files - direct read
        text = await file.text()
      } else if (fileExt === 'pdf' || file.type === 'application/pdf') {
        // PDF files - try to extract text
        try {
          const formData = new FormData()
          formData.append('file', file)
          const res = await fetch('/api/extract-pdf', {
            method: 'POST',
            body: formData
          })
          if (res.ok) {
            const data = await res.json()
            text = data.text || ''
          }
        } catch (err) {
          console.warn('PDF extraction failed:', err)
        }
        
        // If extraction failed or no text, show message
        if (!text || text.trim().length < 50) {
          text = `📄 ${title}\n\nPDF uploaded successfully!\n\nNote: This PDF's text content could not be extracted automatically.\n\nTo read this book:\n1. Convert your PDF to TXT format\n2. Delete this book from your library\n3. Re-upload as TXT file\n\nOr use the AI Chat to ask questions about uploaded PDFs.`
        }
      } else if (fileExt === 'doc' || fileExt === 'docx' || file.type.includes('word')) {
        // DOCX files - show message
        text = `📎 ${title}\n\nWord document uploaded successfully!\n\nNote: Word document text extraction is not yet available.\n\nTo read this book:\n1. Open the document in Word\n2. Save As → Plain Text (.txt)\n3. Delete this book from your library\n4. Re-upload the TXT file\n\nFile stored: ${file.name}`
      } else {
        // Other files
        text = `📎 ${title}\n\nFile uploaded: ${file.name}\n\nThis file format is not supported for reading.\n\nSupported formats:\n- TXT (Plain Text) - Best option\n- PDF (with extractable text)\n\nPlease convert your file to TXT format and re-upload.`
      }

      // Process into pages
      const chunks = text.match(/.{1,2000}/gs) || []
      if (chunks.length > 0) {
        const pages = chunks.map((content, index) => ({
          book_id: bookData.id,
          page_number: index + 1,
          content,
        }))
        
        const batchSize = 100
        for (let i = 0; i < pages.length; i += batchSize) {
          const batch = pages.slice(i, i + batchSize)
          await supabase.from('book_pages').insert(batch)
        }
      }

      router.push('/library')
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
            <Button asChild variant="ghost" size="sm" className="mb-4">
              <Link href="/library">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Upload Book</h1>
            <p className="text-muted-foreground">Add a new book to your library</p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Cover Image (Optional)</label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-32 h-40 bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed">
                      {coverPreview ? (
                        <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, or WebP (max 2MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Author *</label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description"
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">File *</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Supported: TXT (recommended), PDF (with text), DOCX
                  </p>
                  <div className="mt-2 relative">
                    <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                      <div className="flex-1">
                        {file ? (
                          <>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {file.name.endsWith('.pdf') && (
                              <p className="text-xs text-amber-600 mt-1">
                                ⚠️ PDF: Text will be extracted automatically
                              </p>
                            )}
                            {(file.name.endsWith('.doc') || file.name.endsWith('.docx')) && (
                              <p className="text-xs text-amber-600 mt-1">
                                ⚠️ Word: Please convert to TXT for best results
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground">Click to select a file</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              TXT (best), PDF, or DOCX
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button type="submit" disabled={uploading || !file} className="flex-1">
                    {uploading ? (
                      "Uploading..."
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Book
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/library">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
