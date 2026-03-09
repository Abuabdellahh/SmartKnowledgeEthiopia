-- ============================================
-- REMOVE ALL TRIGGERS AND CONSTRAINTS
-- ============================================

-- Drop all triggers on books table
DROP TRIGGER IF EXISTS books_updated_at ON public.books;
DROP TRIGGER IF EXISTS check_user_permission ON public.books;
DROP TRIGGER IF EXISTS validate_book_owner ON public.books;

-- Remove uploaded_by column and ALL its dependencies
ALTER TABLE public.books DROP COLUMN IF EXISTS uploaded_by CASCADE;

-- Make category optional
ALTER TABLE public.books ALTER COLUMN category_id DROP NOT NULL;

-- Disable RLS
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON public.books TO authenticated;
GRANT ALL ON public.books TO anon;

-- Refresh
NOTIFY pgrst, 'reload schema';

-- ============================================
-- This removes triggers that might check auth.users
-- ============================================
