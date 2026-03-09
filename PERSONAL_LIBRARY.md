# Personal Knowledge Library - Deployment Guide

## Overview

Users can now upload and manage their own books with AI-powered study tools.

## Database Setup

Apply the migration:

```bash
psql $DATABASE_URL -f supabase/migrations/004_personal_library.sql
```

This creates:
- `uploaded_by` column in books table
- `book_pages` table for chunked content
- RLS policies (users only access their own books)
- Storage bucket `user-books` with RLS

## Deploy Edge Functions

```bash
# Process uploaded books
supabase functions deploy process-book

# AI tools for books
supabase functions deploy book-ai-tools
```

## Features

### 1. Library Page (`/library`)
- View all user's uploaded books
- Delete books
- Navigate to upload page

### 2. Upload Page (`/upload`)
- Upload PDF or TXT files
- Add title, author, description
- Files stored in Supabase Storage
- Automatic text processing

### 3. Book Reader (`/book/[id]`)
- Page-by-page reading
- AI sidebar with tools:
  - Summarize
  - Explain
  - Generate Quiz
  - Generate Flashcards
  - Voice Reading (TTS)
- Navigation controls

## Security

All books are private by default:
- Users can only see their own books
- RLS enforced at database level
- Storage policies restrict file access
- Edge functions validate user auth

## Testing

1. Sign in as any user
2. Navigate to `/library`
3. Click "Upload Book"
4. Upload a TXT or PDF file
5. View book in library
6. Click "Read" to open book reader
7. Use AI tools in sidebar

## File Structure

```
app/
├── library/page.tsx          # User's book library
├── upload/page.tsx            # Upload new book
└── book/[id]/page.tsx         # Book reader with AI

supabase/
├── migrations/
│   └── 004_personal_library.sql
└── functions/
    ├── process-book/          # Process uploaded files
    └── book-ai-tools/         # AI tools for books
```

## Notes

- Books are user-specific (not shared)
- Files stored in `user-books` bucket
- Text chunked into pages (2000 chars each)
- AI tools use Groq API
- Voice reading uses browser TTS
