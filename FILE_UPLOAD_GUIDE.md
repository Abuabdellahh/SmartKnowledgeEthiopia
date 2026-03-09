# 📚 File Upload Support - Complete Guide

## ✅ Supported File Formats

### 1. **TXT (Plain Text)** - ⭐ RECOMMENDED
- **Best for**: All books and documents
- **Processing**: Instant, 100% accurate
- **File size**: Any size
- **How to use**: Just upload directly

### 2. **PDF (Portable Document Format)** - ⚠️ LIMITED
- **Best for**: PDFs with extractable text
- **Processing**: Automatic text extraction
- **Limitations**: 
  - Scanned PDFs (images) won't work
  - Complex formatting may be lost
  - Tables and images are skipped
- **How to use**: Upload directly, system will try to extract text

### 3. **DOC/DOCX (Microsoft Word)** - ❌ NOT YET SUPPORTED
- **Status**: Coming soon
- **Current workaround**: Save as TXT in Word
- **How to convert**:
  1. Open in Microsoft Word
  2. File → Save As
  3. Choose "Plain Text (*.txt)"
  4. Upload the TXT file

## 🚀 How It Works

### Upload Process:
```
1. User selects file
2. System checks file type
3. Text extraction:
   - TXT: Direct read ✅
   - PDF: Extract text via pdf-parse ⚙️
   - DOCX: Show conversion message ℹ️
4. Split into pages (2000 chars each)
5. Save to database
6. Ready to read! 📖
```

### Technical Stack:
- **PDF Extraction**: `pdf-parse` library
- **Text Processing**: Chunking algorithm
- **Storage**: Supabase Storage + PostgreSQL
- **API**: Next.js API route `/api/extract-pdf`

## 📝 Best Practices

### For Users:
1. **Always prefer TXT format** for best results
2. **Test PDFs first** - upload a small PDF to see if text extracts
3. **Check the preview** after upload to ensure content is readable
4. **File naming**: Use descriptive names (e.g., "Biology_Chapter1.txt")

### For Developers:
1. **Validate file types** on both client and server
2. **Set file size limits** (recommend 10MB max)
3. **Handle extraction failures** gracefully
4. **Show progress indicators** for large files
5. **Implement retry logic** for failed extractions

## 🔧 Converting Files to TXT

### PDF to TXT:
**Option 1: Online Converters**
- Adobe PDF to Text: https://www.adobe.com/acrobat/online/pdf-to-text.html
- PDF2TXT: https://pdf2txt.com
- Zamzar: https://www.zamzar.com/convert/pdf-to-txt/

**Option 2: Desktop Software**
- Adobe Acrobat: File → Export To → Text
- Preview (Mac): File → Export → Plain Text
- Calibre (Free): Convert Books → TXT

**Option 3: Command Line**
```bash
# Using pdftotext (Linux/Mac)
pdftotext input.pdf output.txt

# Using Python
pip install pdfplumber
python -c "import pdfplumber; pdf = pdfplumber.open('input.pdf'); print(''.join([p.extract_text() for p in pdf.pages]))" > output.txt
```

### DOCX to TXT:
**Microsoft Word:**
1. Open document
2. File → Save As
3. Format: Plain Text (*.txt)
4. Click Save

**Google Docs:**
1. Open document
2. File → Download → Plain Text (.txt)

**LibreOffice:**
1. Open document
2. File → Save As
3. File type: Text (.txt)

## ⚡ Performance Optimization

### Current Implementation:
- **Chunk size**: 2000 characters per page
- **Batch insert**: 100 pages at a time
- **Parallel processing**: File upload + text extraction
- **Caching**: Pages stored in database

### Recommendations:
1. **For large files (>5MB)**:
   - Show progress bar
   - Process in background
   - Send email when complete

2. **For PDFs**:
   - Validate extractable text first
   - Show preview before saving
   - Offer manual text input option

3. **For better UX**:
   - Drag & drop upload
   - Multiple file upload
   - Bulk operations

## 🐛 Troubleshooting

### "PDF text could not be extracted"
**Causes:**
- Scanned PDF (image-based)
- Password-protected PDF
- Corrupted file
- Complex formatting

**Solutions:**
1. Use OCR software to convert scanned PDF
2. Remove password protection
3. Try different PDF converter
4. Convert to TXT manually

### "File format not supported"
**Solution:**
- Convert to TXT format
- Check file extension
- Ensure file is not corrupted

### "Upload failed"
**Causes:**
- File too large
- Network timeout
- Storage bucket not configured

**Solutions:**
1. Check file size (max 10MB recommended)
2. Check internet connection
3. Verify Supabase storage bucket exists
4. Check browser console for errors

## 📊 File Format Comparison

| Format | Speed | Accuracy | File Size | Recommended |
|--------|-------|----------|-----------|-------------|
| TXT    | ⚡⚡⚡  | 100%     | Small     | ✅ Yes      |
| PDF    | ⚡⚡   | 70-90%   | Medium    | ⚠️ Maybe   |
| DOCX   | ❌    | N/A      | Medium    | ❌ No       |

## 🔮 Future Enhancements

### Planned Features:
1. **DOCX Support**: Using `mammoth` library
2. **OCR for Scanned PDFs**: Using Tesseract.js
3. **EPUB Support**: For e-books
4. **Markdown Support**: For technical docs
5. **Batch Upload**: Multiple files at once
6. **Cloud Import**: From Google Drive, Dropbox
7. **URL Import**: Download from web links

### Installation for Future Features:
```bash
# DOCX support
npm install mammoth

# OCR support
npm install tesseract.js

# EPUB support
npm install epub2txt
```

## 📚 Code Examples

### Upload with Progress:
```typescript
const handleUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const xhr = new XMLHttpRequest()
  xhr.upload.addEventListener('progress', (e) => {
    const percent = (e.loaded / e.total) * 100
    setProgress(percent)
  })
  
  xhr.open('POST', '/api/upload')
  xhr.send(formData)
}
```

### Validate File Type:
```typescript
const validateFile = (file: File): boolean => {
  const validTypes = ['text/plain', 'application/pdf']
  const validExts = ['.txt', '.pdf']
  
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  return validTypes.includes(file.type) || validExts.includes(ext)
}
```

## 🎯 Summary

**Current Status:**
- ✅ TXT: Fully supported
- ⚠️ PDF: Supported with limitations
- ❌ DOCX: Not yet supported

**Recommendation:**
Always convert to TXT for best results. It's fast, accurate, and works 100% of the time.

**For Users:**
Use online converters or desktop software to convert PDFs/DOCX to TXT before uploading.

**For Developers:**
The system is production-ready for TXT files. PDF support is experimental and should be clearly communicated to users.
