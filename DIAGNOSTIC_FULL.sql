-- ============================================
-- COMPREHENSIVE DIAGNOSTIC
-- Run this FIRST to find the problem
-- ============================================

-- 1. Check what columns books table actually has
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'books'
ORDER BY ordinal_position;

-- 2. Check ALL triggers on books
SELECT 
    tgname AS trigger_name,
    tgtype,
    proname AS function_name,
    prosrc AS function_source
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'public.books'::regclass;

-- 3. Check ALL policies
SELECT * FROM pg_policies WHERE tablename = 'books';

-- 4. Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'books';

-- 5. Check foreign keys
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'books' AND tc.constraint_type = 'FOREIGN KEY';
