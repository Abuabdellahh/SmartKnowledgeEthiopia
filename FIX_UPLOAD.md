# 🔧 Fix Upload & Edit Issues

## Problem: "Upload failed" or "Save" not working

## ✅ Quick Fix (3 Steps)

### Step 1: Run SQL (2 minutes)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste:

```sql
-- Add columns
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS uploaded_by UUID;

-- Fix permissions
DROP POLICY IF EXISTS "Only admins can insert/update/delete books" ON public.books;
DROP POLICY IF EXISTS "Users can manage own books" ON public.books;

CREATE POLICY "Authenticated users can insert books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update books"
  ON public.books FOR UPDATE
  USING (auth.uid() IS NOT NULL);
```

4. Click **Run**

### Step 2: Create Storage Buckets (3 minutes)

#### Bucket 1: user-books
1. Go to **Storage** → **New Bucket**
2. Name: `user-books`
3. Check ✅ **Public bucket**
4. Click **Create**
5. Click on `user-books` → **Policies** → **New Policy**
6. Add 2 policies:

**Upload Policy:**
- Name: `Allow authenticated uploads`
- Target roles: `authenticated`
- Policy command: `INSERT`
- Policy definition: `true`

**Read Policy:**
- Name: `Allow public read`
- Target roles: `public`
- Policy command: `SELECT`
- Policy definition: `true`

#### Bucket 2: book-covers
1. Go to **Storage** → **New Bucket**
2. Name: `book-covers`
3. Check ✅ **Public bucket**
4. Click **Create**
5. Click on `book-covers` → **Policies** → **New Policy**
6. Add same 2 policies as above

### Step 3: Test (1 minute)

1. Go to `/upload`
2. Fill in book details
3. Select a TXT file
4. Click **Upload Book**
5. Should work! ✅

## 🐛 Still Having Issues?

### Check Browser Console:
1. Press **F12**
2. Go to **Console** tab
3. Try uploading again
4. Look for red error messages
5. Share the error for help

### Common Errors:

**"Storage error: Bucket not found"**
- ✅ Fix: Create the storage buckets (Step 2)

**"Database error: permission denied"**
- ✅ Fix: Run the SQL (Step 1)

**"Not authenticated"**
- ✅ Fix: Log out and log back in

**"Failed to upload cover"**
- ✅ Fix: Create book-covers bucket (Step 2)

**"Upload failed" (no details)**
- ✅ Fix: Check browser console (F12) for details

## 📋 Checklist

Before uploading, make sure:
- [ ] SQL script ran successfully
- [ ] `user-books` bucket created
- [ ] `user-books` bucket is public
- [ ] `user-books` has 2 policies
- [ ] `book-covers` bucket created
- [ ] `book-covers` bucket is public
- [ ] `book-covers` has 2 policies
- [ ] You're logged in
- [ ] File is TXT or PDF

## 💡 Tips

- **Best file format**: TXT (plain text)
- **PDF support**: Limited, may not extract text
- **Cover images**: JPG, PNG, WebP (max 2MB)
- **File size**: No strict limit, but smaller is faster

## 🎯 What Each Part Does

**SQL Script:**
- Adds columns for covers and descriptions
- Fixes permissions so you can upload/edit

**user-books Bucket:**
- Stores the actual book files (TXT, PDF)
- Must be public so you can read them

**book-covers Bucket:**
- Stores cover images
- Must be public so they display

**Policies:**
- Allow you to upload files
- Allow everyone to view files

---

**Need more help?** Check the browser console (F12) and share the error message!
