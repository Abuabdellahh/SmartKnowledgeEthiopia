"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AISidebar } from "@/components/ai/AISidebar"
import { PDFViewer } from "@/components/PDFViewer"
import { supabase } from "@/lib/supabaseClient"

interface BookPage {
  page_number: number
  content: string
}

export default function BookReaderPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.id as string
  
  const [book, setBook] = useState<any>(null)
  const [pages, setPages] = useState<BookPage[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fileType, setFileType] = useState<'text' | 'pdf' | 'unknown'>('unknown')
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [pdfPageText, setPdfPageText] = useState<string>('')
  const [extracting, setExtracting] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: bookData, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single()

      if (error || !bookData) {
        setLoading(false)
        return
      }

      setBook(bookData)

      // Determine file type
      const fileName = bookData.file_url?.toLowerCase() || ''
      if (fileName.endsWith('.pdf')) {
        setFileType('pdf')
        console.log('Fetching PDF from storage:', bookData.file_url)
        
        const { data, error: urlError } = await supabase.storage
          .from('user-books')
          .createSignedUrl(bookData.file_url, 3600)
        
        console.log('Signed URL response:', { data, urlError })
        
        if (urlError || !data) {
          console.error('Failed to get signed URL:', urlError)
          setLoading(false)
          return
        }
        
        console.log('Setting PDF URL:', data.signedUrl)
        setFileUrl(data.signedUrl)
        
        console.log('Book data:', { extracted_text: bookData.extracted_text, page_count: bookData.page_count })
        
        // Check if text already extracted
        if (bookData.extracted_text) {
          console.log('Using cached extracted text, length:', bookData.extracted_text.length)
          setPdfPageText(bookData.extracted_text)
        } else {
          console.log('No cached text, extracting from PDF...')
          // Extract text from PDF
          setExtracting(true)
          try {
            console.log('Calling extract-pdf-text API...')
            const response = await fetch('/api/extract-pdf-text', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                bookId: bookData.id, 
                fileUrl: bookData.file_url 
              })
            })
            const result = await response.json()
            console.log('Extraction result:', result)
            if (result.text) {
              console.log('Setting extracted text, length:', result.text.length)
              setPdfPageText(result.text)
            } else if (result.error) {
              console.error('Extraction error:', result.error)
            }
          } catch (err) {
            console.error('Text extraction failed:', err)
          }
          setExtracting(false)
        }
        
        setLoading(false)
        return
      } else if (fileName.endsWith('.txt')) {
        setFileType('text')
      } else {
        setFileType('unknown')
      }

      const { data: pagesData } = await supabase
        .from("book_pages")
        .select("*")
        .eq("book_id", bookId)
        .order("page_number")

      if (pagesData && pagesData.length > 0) {
        setPages(pagesData)
      } else {
        // No pages found - try to fetch and process the file
        try {
          const { data: fileData, error: fileError } = await supabase.storage
            .from('user-books')
            .download(bookData.file_url)

          if (fileError) {
            console.error('Storage error:', fileError)
            setPages([{
              page_number: 1,
              content: `📄 ${bookData.title}\n\n⚠️ Could not load book file.\n\nThe file may have been deleted or moved.\n\nPlease re-upload this book.`
            }])
            setLoading(false)
            return
          }

          // Try to read as text
          const text = await fileData.text()
          
          // Check if it's readable text
          if (text.includes('%PDF') || text.includes('\x00') || text.length < 10) {
            // Binary file or PDF
            setPages([{
              page_number: 1,
              content: `📄 ${bookData.title}\n\n⚠️ This book was uploaded as a PDF or binary file.\n\nThe text content hasn't been extracted yet.\n\nTo read this book:\n1. Go back to Library\n2. Delete this book\n3. Convert your PDF to TXT format\n4. Re-upload the TXT file\n\nNote: Only TXT files can be read directly in the app.`
            }])
          } else {
            // Readable text - create pages and save them
            const chunks = text.match(/.{1,2000}/gs) || []
            const tempPages = chunks.map((content, i) => ({
              page_number: i + 1,
              content
            }))
            
            // Save pages to database for future use
            const pagesToSave = tempPages.map((page, index) => ({
              book_id: bookData.id,
              page_number: index + 1,
              content: page.content,
            }))
            
            // Insert in batches
            const batchSize = 100
            for (let i = 0; i < pagesToSave.length; i += batchSize) {
              const batch = pagesToSave.slice(i, i + batchSize)
              await supabase.from('book_pages').insert(batch)
            }
            
            setPages(tempPages)
          }
        } catch (err) {
          console.error('Fetch error:', err)
          setPages([{
            page_number: 1,
            content: `📄 ${bookData.title}\n\n⚠️ Error loading book content.\n\nPlease re-upload this book as a TXT file.`
          }])
        }
      }

      setLoading(false)
    }

    fetchBook()
  }, [bookId, router])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentPage > 0) {
        setCurrentPage(p => p - 1)
      } else if (e.key === "ArrowRight" && currentPage < pages.length - 1) {
        setCurrentPage(p => p + 1)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentPage, pages.length])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading book...</p>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">Book not found</h2>
              <p className="text-muted-foreground mb-4">The book you are looking for does not exist or you don't have access to it.</p>
              <Button asChild>
                <Link href="/library">Back to Library</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentPageContent = pages[currentPage]?.content || ""

  // PDF Viewer with AI Sidebar
  if (fileType === 'pdf' && fileUrl) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <Button asChild variant="ghost" size="sm" className="mb-2">
              <Link href="/library">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Link>
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold">{book?.title}</h1>
                <p className="text-xs text-muted-foreground">{book?.author}</p>
              </div>
              <Badge variant="secondary" className="gap-1.5">
                <FileText className="h-3 w-3" />
                PDF
              </Badge>
            </div>
          </div>
        </section>

        <div className="flex-1 flex overflow-hidden">
          <AISidebar currentText={pdfPageText} />
          
          <div className="flex-1 flex flex-col">
            {extracting && (
              <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  🔄 Extracting text from PDF for AI analysis...
                </p>
              </div>
            )}
            <PDFViewer 
              fileUrl={fileUrl} 
              title={book?.title || 'Book'}
            />
          </div>
        </div>
        
        <Footer />
      </div>
    )
  }

  // Text Viewer

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <div className="flex-1 flex">
        <AISidebar currentText={currentPageContent} />
        
        <main className="flex-1 flex flex-col">
          <section className="border-b border-border bg-muted/30">
            <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
              <Button asChild variant="ghost" size="sm" className="mb-2">
                <Link href="/library">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Library
                </Link>
              </Button>
              <h1 className="text-xl font-bold">{book?.title}</h1>
              <p className="text-sm text-muted-foreground">{book?.author}</p>
            </div>
          </section>

          <div className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {pages.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      title="Previous page (←)"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
                      disabled={currentPage === pages.length - 1}
                      title="Next page (→)"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  {currentPageContent.includes('📄') || currentPageContent.includes('📎') || currentPageContent.includes('%PDF') || currentPageContent.includes('⚠️') ? (
                    <div className="p-8 bg-amber-50 dark:bg-amber-950 rounded-lg border-2 border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">⚠️</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-3">Book Content Not Available</h3>
                          <p className="text-sm mb-4 leading-relaxed">
                            This book was uploaded as a PDF file, but the text content hasn't been extracted yet.
                          </p>
                          <div className="bg-white dark:bg-amber-900 p-4 rounded-lg mb-4">
                            <p className="text-sm font-semibold mb-2">To read this book:</p>
                            <ol className="text-sm list-decimal list-inside space-y-2">
                              <li>Convert your PDF to TXT format using an online converter</li>
                              <li>Go back to Library and delete this book</li>
                              <li>Upload the TXT file instead</li>
                            </ol>
                          </div>
                          <div className="flex gap-3">
                            <Button asChild variant="default">
                              <Link href="/library">Back to Library</Link>
                            </Button>
                            <Button asChild variant="outline">
                              <a href="https://www.adobe.com/acrobat/online/pdf-to-text.html" target="_blank" rel="noopener noreferrer">
                                Convert PDF to TXT
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {currentPageContent}
                    </pre>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  )
}
