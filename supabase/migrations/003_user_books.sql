-- Add user_id to books table for user-owned books
ALTER TABLE books ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE books ADD COLUMN IF NOT EXISTS download_count INT NOT NULL DEFAULT 0;
ALTER TABLE books ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE books ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_public ON books(is_public) WHERE is_public = true;

-- Drop old policies
DROP POLICY IF EXISTS "Books are readable by everyone" ON books;
DROP POLICY IF EXISTS "Only admins can insert/update/delete books" ON books;

-- New RLS policies for user-owned books
CREATE POLICY "Public books readable by everyone"
ON books FOR SELECT
USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own books"
ON books FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books"
ON books FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own books"
ON books FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all books"
ON books FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE (raw_user_meta_data->>'role') = 'admin'
  )
);

-- Storage bucket for book files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-files', 'book-files', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own book files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'book-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read own book files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'book-files' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR
   EXISTS (
     SELECT 1 FROM books 
     WHERE file_url LIKE '%' || name || '%' AND is_public = true
   ))
);

CREATE POLICY "Users can upload book covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'book-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view book covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-covers');

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  (bucket_id = 'book-files' OR bucket_id = 'book-covers') AND
  auth.uid()::text = (storage.foldername(name))[1]
);
