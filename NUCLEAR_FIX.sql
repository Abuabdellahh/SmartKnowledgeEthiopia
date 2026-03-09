-- ============================================
-- NUCLEAR OPTION - Completely open policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Make category optional
ALTER TABLE public.books ALTER COLUMN category_id DROP NOT NULL;

-- Remove uploaded_by
ALTER TABLE public.books DROP COLUMN IF EXISTS uploaded_by CASCADE;

-- Disable RLS temporarily to drop all policies
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies
DROP POLICY IF EXISTS "Only admins can insert/update/delete books" ON public.books;
DROP POLICY IF EXISTS "Users can manage own books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can insert books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can update books" ON public.books;
DROP POLICY IF EXISTS "Books are readable by everyone" ON public.books;
DROP POLICY IF EXISTS "Anyone can read books" ON public.books;
DROP POLICY IF EXISTS "Anyone authenticated can insert books" ON public.books;
DROP POLICY IF EXISTS "Anyone authenticated can update books" ON public.books;
DROP POLICY IF EXISTS "Anyone authenticated can delete books" ON public.books;

-- Re-enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create completely open policies (NO auth checks)
CREATE POLICY "open_read" ON public.books FOR SELECT USING (true);
CREATE POLICY "open_insert" ON public.books FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update" ON public.books FOR UPDATE USING (true);
CREATE POLICY "open_delete" ON public.books FOR DELETE USING (true);

-- Refresh schema
NOTIFY pgrst, 'reload schema';

-- ============================================
-- This makes books table completely open
-- Anyone can read/write without authentication
-- ============================================
