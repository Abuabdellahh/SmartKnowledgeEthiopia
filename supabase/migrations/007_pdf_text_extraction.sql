-- Add columns for PDF text extraction
ALTER TABLE books ADD COLUMN IF NOT EXISTS extracted_text TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS page_count INTEGER;
