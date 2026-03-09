import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { bookId, fileUrl } = await request.json()

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('user-books')
      .download(fileUrl)

    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'Failed to download PDF' }, { status: 500 })
    }

    const pdfParse = require('pdf-parse')
    const buffer = Buffer.from(await fileData.arrayBuffer())
    const pdfData = await pdfParse(buffer)

    const { error: updateError } = await supabase
      .from('books')
      .update({ 
        extracted_text: pdfData.text,
        page_count: pdfData.numpages 
      })
      .eq('id', bookId)

    if (updateError) {
      console.error('Failed to save extracted text:', updateError)
    }

    return NextResponse.json({ 
      text: pdfData.text,
      pages: pdfData.numpages 
    })
  } catch (error: any) {
    console.error('PDF extraction error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
