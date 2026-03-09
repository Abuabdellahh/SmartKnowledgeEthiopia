-- Personal Knowledge Library Schema
-- Users upload and manage their own books

-- Add columns to books table for user ownership
ALTER TABLE books ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE books ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Create index for user books
CREATE INDEX IF NOT EXISTS idx_books_uploaded_by ON books(uploaded_by);

-- Drop old policies
DROP POLICY IF EXISTS "Public books readable by everyone" ON books;
DROP POLICY IF EXISTS "Users can insert own books" ON books;
DROP POLICY IF EXISTS "Users can update own books" ON books;
DROP POLICY IF EXISTS "Users can delete own books" ON books;
DROP POLICY IF EXISTS "Admins can manage all books" ON books;

-- New RLS policies: Users only access their own books
CREATE POLICY "Users read own books"
ON books FOR SELECT
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users insert own books"
ON books FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users update own books"
ON books FOR UPDATE
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users delete own books"
ON books FOR DELETE
USING (auth.uid() = uploaded_by);

-- Book pages table for chunked content
CREATE TABLE IF NOT EXISTS book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(book_id, page_number)
);

CREATE INDEX idx_book_pages_book ON book_pages(book_id);

ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own book pages"
ON book_pages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM books 
    WHERE books.id = book_pages.book_id 
    AND books.uploaded_by = auth.uid()
  )
);

CREATE POLICY "System inserts book pages"
ON book_pages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM books 
    WHERE books.id = book_pages.book_id 
    AND books.uploaded_by = auth.uid()
  )
);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-books', 'user-books', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Users only access their own files
CREATE POLICY "Users upload own books"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-books' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users read own books"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-books' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own books"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-books' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
