-- ============================================
-- DISABLE RLS COMPLETELY
-- This will make books table work without any restrictions
-- ============================================

-- Remove uploaded_by column
ALTER TABLE public.books DROP COLUMN IF EXISTS uploaded_by CASCADE;

-- Make category optional
ALTER TABLE public.books ALTER COLUMN category_id DROP NOT NULL;

-- DISABLE Row Level Security completely
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';

-- ============================================
-- RLS is now OFF - table is completely open
-- This should fix the auth.users permission error
-- ============================================
