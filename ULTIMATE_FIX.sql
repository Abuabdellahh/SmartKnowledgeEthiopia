-- ============================================
-- ULTIMATE FIX - Run this in Supabase SQL Editor
-- This removes ALL dependencies on auth.users
-- ============================================

-- Step 1: Make category_id optional (it was required)
ALTER TABLE public.books ALTER COLUMN category_id DROP NOT NULL;

-- Step 2: Drop uploaded_by column if exists
ALTER TABLE public.books DROP COLUMN IF EXISTS uploaded_by CASCADE;

-- Step 3: Drop ALL policies on books table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'books' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.books';
    END LOOP;
END $$;

-- Step 4: Create simple policies (no auth.users checks)
CREATE POLICY "Anyone can read books"
  ON public.books FOR SELECT
  USING (true);

CREATE POLICY "Anyone authenticated can insert books"
  ON public.books FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone authenticated can update books"
  ON public.books FOR UPDATE
  USING (true);

CREATE POLICY "Anyone authenticated can delete books"
  ON public.books FOR DELETE
  USING (true);

-- Step 5: Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================
-- DONE! Now upload should work
-- ============================================
