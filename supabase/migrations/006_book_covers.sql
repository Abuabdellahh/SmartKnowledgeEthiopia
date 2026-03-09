-- Add cover_url column if it doesn't exist
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Add description column if it doesn't exist
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add uploaded_by column if it doesn't exist
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for uploaded_by
CREATE INDEX IF NOT EXISTS idx_books_uploaded_by ON public.books(uploaded_by);

-- Update RLS policies to allow users to update books
-- Drop old policies
DROP POLICY IF EXISTS "Users can manage own books" ON public.books;
DROP POLICY IF EXISTS "Only admins can insert/update/delete books" ON public.books;
DROP POLICY IF EXISTS "Books are readable by everyone" ON public.books;

-- Create new policies
CREATE POLICY "Books are readable by everyone"
  ON public.books FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update any book"
  ON public.books FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete books"
  ON public.books FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
