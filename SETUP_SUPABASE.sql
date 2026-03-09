-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

-- 1. Add columns to books table
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS mime_type TEXT;

CREATE INDEX IF NOT EXISTS idx_books_uploaded_by ON books(uploaded_by);

-- 2. Create book_pages table
CREATE TABLE IF NOT EXISTS book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(book_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_book_pages_book ON book_pages(book_id);

-- 3. Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;

-- 4. Drop old policies
DROP POLICY IF EXISTS "Users read own books" ON books;
DROP POLICY IF EXISTS "Users insert own books" ON books;
DROP POLICY IF EXISTS "Users update own books" ON books;
DROP POLICY IF EXISTS "Users delete own books" ON books;
DROP POLICY IF EXISTS "Users read own book pages" ON book_pages;
DROP POLICY IF EXISTS "System inserts book pages" ON book_pages;

-- 5. Create new policies for books
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

-- 6. Create policies for book_pages
CREATE POLICY "Users read own book pages"
ON book_pages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM books 
    WHERE books.id = book_pages.book_id 
    AND books.uploaded_by = auth.uid()
  )
);

CREATE POLICY "Users insert own book pages"
ON book_pages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM books 
    WHERE books.id = book_pages.book_id 
    AND books.uploaded_by = auth.uid()
  )
);

-- ============================================
-- DONE! Now create storage bucket in Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: user-books
-- 4. Public: OFF (private)
-- 5. Click "Create bucket"
-- 
-- Then add these policies in the bucket settings:
-- ============================================
