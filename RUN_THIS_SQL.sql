-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- This fixes the "Edit Book" save button issue
-- ============================================

-- Add missing columns to books table
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS uploaded_by UUID;

-- Remove old restrictive policies
DROP POLICY IF EXISTS "Only admins can insert/update/delete books" ON public.books;
DROP POLICY IF EXISTS "Users can manage own books" ON public.books;

-- Create new permissive policies
CREATE POLICY "Authenticated users can update books"
  ON public.books FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- DONE! Now test editing a book
-- ============================================
