# Book Cover & Edit Feature Setup Guide

## ✨ New Features Added

### 1. **Edit Book Functionality**
- Edit book title, author, and description
- Update book cover image
- Modern dialog interface
- Real-time preview

### 2. **Book Cover Images**
- Upload cover images when creating books
- Update covers when editing books
- Display covers in library (grid and list views)
- Fallback to icon when no cover exists

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Execute the migration file in Supabase SQL Editor:

```bash
# File: supabase/migrations/006_book_covers.sql
```

This will:
- Add `cover_url` column to books table
- Add `description` column to books table
- Add `uploaded_by` column to books table
- Update RLS policies for user book management

### Step 2: Create Storage Bucket

In Supabase Dashboard:

1. Go to **Storage** section
2. Click **New Bucket**
3. Configure:
   - **Name**: `book-covers`
   - **Public**: ✅ Yes (checked)
   - **File size limit**: 2MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`

### Step 3: Set Storage Policies

In Supabase Dashboard > Storage > book-covers > Policies:

#### Policy 1: Upload
```sql
-- Name: Authenticated users can upload covers
-- Operation: INSERT
-- Policy Definition:
(bucket_id = 'book-covers' AND auth.role() = 'authenticated')
```

#### Policy 2: Read
```sql
-- Name: Public can view covers
-- Operation: SELECT
-- Policy Definition:
(bucket_id = 'book-covers')
```

#### Policy 3: Update
```sql
-- Name: Users can update own covers
-- Operation: UPDATE
-- Policy Definition:
(bucket_id = 'book-covers' AND auth.uid()::text = (storage.foldername(name))[1])
```

#### Policy 4: Delete
```sql
-- Name: Users can delete own covers
-- Operation: DELETE
-- Policy Definition:
(bucket_id = 'book-covers' AND auth.uid()::text = (storage.foldername(name))[1])
```

### Step 4: Verify Setup

1. **Test Upload**: Go to `/upload` and upload a book with a cover image
2. **Test Edit**: Go to `/library`, click edit (pencil icon) on any book
3. **Test Display**: Verify covers show in both grid and list views

## 📁 Files Created/Modified

### New Files:
- ✅ `components/edit-book-dialog.tsx` - Edit book dialog component
- ✅ `supabase/migrations/006_book_covers.sql` - Database migration

### Modified Files:
- ✅ `app/library/page.tsx` - Added edit button, cover display, edit dialog
- ✅ `app/upload/page.tsx` - Added cover image upload

## 🎨 UI/UX Features

### Library Page:
- **Edit Button**: Pencil icon next to each book
- **Cover Display**: Shows uploaded covers or fallback icon
- **Grid View**: Large cover images with hover effects
- **List View**: Thumbnail covers in compact layout

### Edit Dialog:
- **Cover Preview**: Shows current or new cover
- **File Upload**: Drag & drop or click to upload
- **Form Fields**: Title, author, description
- **Validation**: Required fields marked
- **Loading States**: Spinner during save

### Upload Page:
- **Cover Upload**: Optional cover image field
- **Preview**: Shows selected image before upload
- **File Types**: Accepts JPG, PNG, WebP
- **Size Limit**: 2MB maximum

## 🔧 Technical Details

### Cover Image Storage:
- **Path**: `covers/{user_id}/{timestamp}.{ext}`
- **Bucket**: `book-covers` (public)
- **Access**: Public read, authenticated write

### Database Schema:
```sql
books {
  id: UUID
  title: TEXT
  author: TEXT
  description: TEXT
  cover_url: TEXT  -- New
  uploaded_by: UUID  -- New
  ...
}
```

### Component Architecture:
```
EditBookDialog
├── Dialog (shadcn/ui)
├── Form with validation
├── Cover image upload
├── Preview functionality
└── Supabase integration
```

## 🎯 User Flow

### Editing a Book:
1. User clicks pencil icon on book card
2. Edit dialog opens with current data
3. User can:
   - Change title/author/description
   - Upload new cover image
   - See preview of changes
4. Click "Save Changes"
5. Dialog closes, library refreshes

### Uploading with Cover:
1. User goes to `/upload`
2. Fills in book details
3. Optionally uploads cover image
4. Sees preview of cover
5. Submits form
6. Redirects to library with new book

## ✅ Features Checklist

- ✅ Edit book metadata (title, author, description)
- ✅ Upload cover images
- ✅ Update cover images
- ✅ Display covers in grid view
- ✅ Display covers in list view
- ✅ Fallback icon when no cover
- ✅ Image preview before upload
- ✅ Proper error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Accessibility support

## 🐛 Troubleshooting

### Cover images not showing:
1. Check storage bucket is public
2. Verify storage policies are set
3. Check browser console for errors
4. Ensure `cover_url` column exists

### Can't upload covers:
1. Verify user is authenticated
2. Check file size < 2MB
3. Verify file type is image/*
4. Check storage bucket exists

### Edit button not working:
1. Verify `EditBookDialog` component imported
2. Check state management
3. Verify Supabase connection

## 📊 Performance Considerations

- Cover images are lazy-loaded
- Thumbnails use object-fit: cover
- Storage uses CDN for fast delivery
- Images cached by browser

## 🔐 Security

- Only authenticated users can upload
- Users can only edit their own books
- Admins can edit all books
- Public read access for covers
- File size limits enforced
- MIME type validation

## 🎨 Design Principles

- **Consistency**: Same design language throughout
- **Feedback**: Loading states and confirmations
- **Accessibility**: Keyboard navigation, ARIA labels
- **Responsiveness**: Works on all screen sizes
- **Performance**: Optimized images and queries

## 📝 Next Steps (Optional Enhancements)

1. Image cropping/resizing tool
2. Bulk edit functionality
3. Cover image templates
4. AI-generated covers
5. Import from URL
6. Drag & drop reordering
7. Cover image optimization
8. Multiple image formats
9. Cover gallery view
10. Social sharing with covers
