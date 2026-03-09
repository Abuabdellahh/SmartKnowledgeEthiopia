-- Create platform_stats table for homepage statistics
CREATE TABLE IF NOT EXISTS platform_stats (
  id TEXT PRIMARY KEY DEFAULT 'main',
  total_books INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  total_categories INTEGER DEFAULT 0,
  active_researchers INTEGER DEFAULT 0,
  universities_connected INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial stats
INSERT INTO platform_stats (id, total_books, total_users, universities_connected)
VALUES ('main', 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Function to update stats automatically
CREATE OR REPLACE FUNCTION update_platform_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE platform_stats
  SET 
    total_books = (SELECT COUNT(*) FROM books),
    total_users = (SELECT COUNT(*) FROM auth.users),
    total_categories = (SELECT COUNT(*) FROM categories),
    updated_at = NOW()
  WHERE id = 'main';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update stats
DROP TRIGGER IF EXISTS update_stats_on_book_change ON books;
CREATE TRIGGER update_stats_on_book_change
AFTER INSERT OR DELETE ON books
FOR EACH STATEMENT
EXECUTE FUNCTION update_platform_stats();

-- Manually update stats with current counts
UPDATE platform_stats
SET 
  total_books = (SELECT COUNT(*) FROM books),
  total_users = (SELECT COUNT(*) FROM auth.users),
  total_categories = (SELECT COUNT(*) FROM categories),
  updated_at = NOW()
WHERE id = 'main';
