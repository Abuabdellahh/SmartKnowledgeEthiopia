# 🔧 Fix "Edit Book" Not Working

## Problem
The "Save" button in Edit Book dialog doesn't work due to missing database permissions.

## ✅ Solution (2 Steps)

### Step 1: Run SQL in Supabase

1. Go to **Supabase Dashboard**
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Add missing columns
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS uploaded_by UUID;

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Only admins can insert/update/delete books" ON public.books;
DROP POLICY IF EXISTS "Users can manage own books" ON public.books;

-- Allow authenticated users to update books
CREATE POLICY "Authenticated users can update books"
  ON public.books FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert books
CREATE POLICY "Authenticated users can insert books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

### Step 2: Create Storage Bucket (for cover images)

1. Go to **Storage** (left sidebar)
2. Click **New Bucket**
3. Enter name: `book-covers`
4. Check ✅ **Public bucket**
5. Click **Create bucket**

6. Click on `book-covers` bucket
7. Go to **Policies** tab
8. Click **New Policy**
9. Select **For full customization**
10. Add these 2 policies:

**Policy 1: Allow Upload**
- Name: `Allow authenticated uploads`
- Target roles: `authenticated`
- Policy command: `INSERT`
- Policy definition: `true`

**Policy 2: Allow Public Read**
- Name: `Allow public read`
- Target roles: `public`
- Policy command: `SELECT`
- Policy definition: `true`

### Step 3: Test

1. Go to your Library page
2. Click the pencil icon (✏️) on any book
3. Change the title or upload a cover
4. Click **Save Changes**
5. Should work now! ✅

## 🐛 Still Not Working?

### Check Browser Console:
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Try editing a book again
4. Look for error messages
5. Share the error message for help

### Common Issues:

**Error: "Failed to update book: permission denied"**
- Solution: Make sure you ran the SQL in Step 1

**Error: "Failed to upload cover"**
- Solution: Make sure you created the storage bucket in Step 2

**Error: "Not authenticated"**
- Solution: Log out and log back in

**No error but nothing happens**
- Solution: Check if the dialog closes. If yes, refresh the page to see changes.

## 📝 What This Does

The SQL script:
1. ✅ Adds `cover_url` column for book covers
2. ✅ Adds `description` column for book descriptions
3. ✅ Adds `uploaded_by` column to track who uploaded
4. ✅ Removes old restrictive policies
5. ✅ Adds new policies that allow editing

The storage bucket:
1. ✅ Stores book cover images
2. ✅ Makes covers publicly accessible
3. ✅ Allows authenticated users to upload

## ✨ After Setup

You'll be able to:
- ✅ Edit book titles
- ✅ Edit book authors
- ✅ Add descriptions
- ✅ Upload cover images
- ✅ Update cover images

---

**Need help?** Check the browser console (F12) for error messages.
