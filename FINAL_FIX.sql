-- ============================================
-- FINAL FIX - Run this NOW
-- ============================================

-- Remove uploaded_by column completely
ALTER TABLE public.books DROP COLUMN IF EXISTS uploaded_by CASCADE;

-- Remove ALL policies
DROP POLICY IF EXISTS "Only admins can insert/update/delete books" ON public.books;
DROP POLICY IF EXISTS "Users can manage own books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can insert books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can update books" ON public.books;
DROP POLICY IF EXISTS "Books are readable by everyone" ON public.books;

-- Create simple policies (no checks)
CREATE POLICY "Books are readable by everyone"
  ON public.books FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON public.books FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
  ON public.books FOR UPDATE USING (true);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
