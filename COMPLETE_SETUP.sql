-- ============================================
-- COMPLETE SETUP FOR BOOK UPLOAD & EDIT
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add missing columns to books table
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS uploaded_by UUID;

-- Step 2: Remove the foreign key constraint if it exists
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_uploaded_by_fkey;

-- Step 3: Remove ALL existing policies
DROP POLICY IF EXISTS "Only admins can insert/update/delete books" ON public.books;
DROP POLICY IF EXISTS "Users can manage own books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can insert books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can update books" ON public.books;
DROP POLICY IF EXISTS "Books are readable by everyone" ON public.books;

-- Step 4: Create fresh policies
CREATE POLICY "Books are readable by everyone"
  ON public.books FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update books"
  ON public.books FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- AFTER RUNNING THIS SQL:
-- ============================================
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create bucket: "user-books" (Public: Yes)
-- 3. Create bucket: "book-covers" (Public: Yes)
-- 4. Add storage policies (see below)
-- ============================================

-- Storage Policies for "user-books" bucket:
-- Policy 1: Allow authenticated uploads
--   Name: Allow authenticated uploads
--   Target: authenticated
--   Command: INSERT
--   Definition: true

-- Policy 2: Allow public read
--   Name: Allow public read
--   Target: public
--   Command: SELECT
--   Definition: true

-- Storage Policies for "book-covers" bucket:
-- Policy 1: Allow authenticated uploads
--   Name: Allow authenticated uploads
--   Target: authenticated
--   Command: INSERT
--   Definition: true

-- Policy 2: Allow public read
--   Name: Allow public read
--   Target: public
--   Command: SELECT
--   Definition: true

-- ============================================
-- DONE! Now you can:
-- - Upload books with covers
-- - Edit book details
-- - Update book covers
-- ============================================
