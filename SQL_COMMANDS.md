-- =====================================================
-- QUICK SQL COMMANDS - Smart Knowledge Ethiopia
-- =====================================================
-- Copy and paste these commands into Supabase SQL Editor
-- or run via psql

-- =====================================================
-- 1. CHECK CURRENT USER ROLES
-- =====================================================

-- View all users and their roles
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Count users by role
SELECT 
  raw_user_meta_data->>'role' as role,
  COUNT(*) as count
FROM auth.users
GROUP BY raw_user_meta_data->>'role';

-- =====================================================
-- 2. UPDATE USER ROLES
-- =====================================================

-- Set a user to student
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"student"'
)
WHERE email = 'user@example.com';

-- Set a user to teacher
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"teacher"'
)
WHERE email = 'teacher@example.com';

-- Set a user to admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@example.com';

-- Set all users without a role to student (default)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"student"'
)
WHERE raw_user_meta_data->>'role' IS NULL;

-- =====================================================
-- 3. CHECK RLS POLICIES
-- =====================================================

-- List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('books', 'reviews', 'notes', 'chat_messages', 'ai_usage_logs');

-- =====================================================
-- 4. ENABLE/DISABLE RLS (FOR TESTING)
-- =====================================================

-- Disable RLS on all tables (TESTING ONLY!)
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS (PRODUCTION)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. VIEW USAGE STATISTICS
-- =====================================================

-- Total AI usage by feature
SELECT 
  feature_type,
  COUNT(*) as usage_count,
  SUM(tokens_used) as total_tokens
FROM ai_usage_logs
GROUP BY feature_type
ORDER BY usage_count DESC;

-- AI usage by user
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as role,
  COUNT(l.id) as query_count,
  SUM(l.tokens_used) as total_tokens
FROM auth.users u
LEFT JOIN ai_usage_logs l ON u.id = l.user_id
GROUP BY u.id, u.email, u.raw_user_meta_data->>'role'
ORDER BY query_count DESC;

-- Recent AI usage (last 24 hours)
SELECT 
  u.email,
  l.feature_type,
  l.tokens_used,
  l.created_at
FROM ai_usage_logs l
JOIN auth.users u ON l.user_id = u.id
WHERE l.created_at > NOW() - INTERVAL '24 hours'
ORDER BY l.created_at DESC;

-- =====================================================
-- 6. BOOK STATISTICS
-- =====================================================

-- Total books by category
SELECT 
  c.name as category,
  COUNT(b.id) as book_count
FROM books b
JOIN categories c ON b.category_id = c.id
GROUP BY c.name
ORDER BY book_count DESC;

-- Most downloaded books
SELECT 
  title,
  author,
  download_count,
  rating
FROM books
ORDER BY download_count DESC
LIMIT 10;

-- Books with most reviews
SELECT 
  b.title,
  COUNT(r.id) as review_count,
  AVG(r.rating) as avg_rating
FROM books b
LEFT JOIN reviews r ON b.id = r.book_id
GROUP BY b.id, b.title
ORDER BY review_count DESC
LIMIT 10;

-- =====================================================
-- 7. USER ACTIVITY
-- =====================================================

-- Users with most notes
SELECT 
  u.email,
  COUNT(n.id) as note_count
FROM auth.users u
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.email
ORDER BY note_count DESC
LIMIT 10;

-- Users with most reviews
SELECT 
  u.email,
  COUNT(r.id) as review_count
FROM auth.users u
LEFT JOIN reviews r ON u.id = r.user_id
GROUP BY u.id, u.email
ORDER BY review_count DESC
LIMIT 10;

-- Active users (last 7 days)
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as role,
  MAX(l.created_at) as last_activity
FROM auth.users u
LEFT JOIN ai_usage_logs l ON u.id = l.user_id
WHERE l.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.id, u.email, u.raw_user_meta_data->>'role'
ORDER BY last_activity DESC;

-- =====================================================
-- 8. CLEANUP OPERATIONS
-- =====================================================

-- Delete old usage logs (older than 90 days)
DELETE FROM ai_usage_logs
WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete orphaned notes (user deleted)
DELETE FROM notes
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Delete orphaned reviews (user deleted)
DELETE FROM reviews
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- =====================================================
-- 9. TESTING QUERIES
-- =====================================================

-- Test RLS as a specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'USER_UUID_HERE';

-- View what this user can see
SELECT * FROM notes;
SELECT * FROM chat_messages;

-- Reset to default role
RESET ROLE;

-- =====================================================
-- 10. BACKUP QUERIES
-- =====================================================

-- Export user roles (for backup)
COPY (
  SELECT 
    email,
    raw_user_meta_data->>'role' as role
  FROM auth.users
) TO '/tmp/user_roles_backup.csv' WITH CSV HEADER;

-- Export usage statistics (for analysis)
COPY (
  SELECT 
    u.email,
    l.feature_type,
    l.tokens_used,
    l.created_at
  FROM ai_usage_logs l
  JOIN auth.users u ON l.user_id = u.id
) TO '/tmp/usage_stats_backup.csv' WITH CSV HEADER;

-- =====================================================
-- 11. PERFORMANCE MONITORING
-- =====================================================

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Check slow queries (if pg_stat_statements is enabled)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- =====================================================
-- 12. EMERGENCY PROCEDURES
-- =====================================================

-- Grant admin access to yourself (EMERGENCY ONLY)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'YOUR_EMAIL_HERE';

-- Temporarily disable all RLS (EMERGENCY ONLY)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE 'ALTER TABLE ' || r.tablename || ' DISABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- Re-enable all RLS (AFTER EMERGENCY)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE 'ALTER TABLE ' || r.tablename || ' ENABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- =====================================================
-- 13. USEFUL HELPER QUERIES
-- =====================================================

-- Find users by email pattern
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email LIKE '%@gmail.com'
ORDER BY created_at DESC;

-- Count records per table
SELECT 
  'books' as table_name, COUNT(*) as count FROM books
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'notes', COUNT(*) FROM notes
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages
UNION ALL
SELECT 'ai_usage_logs', COUNT(*) FROM ai_usage_logs
UNION ALL
SELECT 'users', COUNT(*) FROM auth.users;

-- Check for duplicate emails (shouldn't happen)
SELECT email, COUNT(*)
FROM auth.users
GROUP BY email
HAVING COUNT(*) > 1;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Always backup before running UPDATE/DELETE queries
-- 2. Test RLS changes in development first
-- 3. Monitor performance after changes
-- 4. Keep usage logs for analytics
-- 5. Regular cleanup of old data
-- 6. Document any manual changes
-- =====================================================
