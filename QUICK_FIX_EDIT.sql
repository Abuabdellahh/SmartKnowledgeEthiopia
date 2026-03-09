-- QUICK FIX: Run this in Supabase SQL Editor to enable book editing

-- Step 1: Add missing columns
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Drop old restrictive policies
DROP POLICY IF EXISTS "Only admins can insert/update/delete books" ON public.books;
DROP POLICY IF EXISTS "Users can manage own books" ON public.books;

-- Step 3: Create permissive policies for authenticated users
CREATE POLICY "Authenticated users can update books"
  ON public.books FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Step 4: Verify books table has SELECT policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'books' 
    AND policyname = 'Books are readable by everyone'
  ) THEN
    EXECUTE 'CREATE POLICY "Books are readable by everyone" ON public.books FOR SELECT USING (true)';
  END IF;
END $$;

-- Done! Now try editing a book again.
