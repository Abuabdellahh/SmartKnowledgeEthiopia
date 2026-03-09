# Supabase Setup Guide - Personal Library

## Step 1: Run SQL Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy and paste the contents of `SETUP_SUPABASE.sql`
6. Click **Run** (or press Ctrl+Enter)

## Step 2: Create Storage Bucket

### Option A: Using Dashboard (Recommended)

1. In Supabase Dashboard, click **Storage** in left sidebar
2. Click **New bucket** button
3. Fill in:
   - **Name**: `user-books`
   - **Public**: Toggle OFF (keep it private)
4. Click **Create bucket**

### Option B: Using SQL

Run this in SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-books', 'user-books', false)
ON CONFLICT (id) DO NOTHING;
```

## Step 3: Add Storage Policies

1. In **Storage**, click on the `user-books` bucket
2. Click **Policies** tab
3. Click **New policy**
4. Add these 3 policies:

### Policy 1: Upload
```sql
CREATE POLICY "Users upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-books' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 2: Read
```sql
CREATE POLICY "Users read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-books' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 3: Delete
```sql
CREATE POLICY "Users delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-books' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 4: Test Upload

1. Sign in to your app
2. Go to `/upload`
3. Fill in book details
4. Select a TXT file
5. Click "Upload Book"
6. Should redirect to `/library` with your book

## Troubleshooting

### "Bucket not found"
- Make sure you created the `user-books` bucket in Step 2

### "Permission denied" 
- Check storage policies are added in Step 3

### "Row level security policy violation"
- Make sure SQL migration ran successfully in Step 1

### Check if bucket exists:
```sql
SELECT * FROM storage.buckets WHERE id = 'user-books';
```

### Check if policies exist:
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'user-books';
```
