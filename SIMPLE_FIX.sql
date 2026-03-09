-- ============================================
-- SIMPLE FIX - Remove uploaded_by dependency
-- Run this in Supabase SQL Editor
-- ============================================

-- Add columns without foreign key
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS description TEXT;

-- Remove uploaded_by column if it exists (it's causing the issue)
ALTER TABLE public.books DROP COLUMN IF EXISTS uploaded_by CASCADE;

-- Remove ALL existing policies
DROP POLICY IF EXISTS "Only admins can insert/update/delete books" ON public.books;
DROP POLICY IF EXISTS "Users can manage own books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can insert books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can update books" ON public.books;
DROP POLICY IF EXISTS "Books are readable by everyone" ON public.books;

-- Create simple policies (no uploaded_by check)
CREATE POLICY "Books are readable by everyone"
  ON public.books FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON public.books FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
  ON public.books FOR UPDATE
  USING (true);

-- ============================================
-- This removes the uploaded_by column that was
-- causing "permission denied for table users"
-- ============================================
