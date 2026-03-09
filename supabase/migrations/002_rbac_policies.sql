-- =====================================================
-- ROLE-BASED ACCESS CONTROL (RBAC) POLICIES
-- Smart Knowledge Ethiopia (SKE)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BOOKS TABLE POLICIES
-- =====================================================

-- Everyone can view books
CREATE POLICY "Anyone can view books"
ON books FOR SELECT
USING (true);

-- Only admins can insert books
CREATE POLICY "Admins can insert books"
ON books FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE (raw_user_meta_data->>'role') = 'admin'
  )
);

-- Only admins can update books
CREATE POLICY "Admins can update books"
ON books FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE (raw_user_meta_data->>'role') = 'admin'
  )
);

-- Only admins can delete books
CREATE POLICY "Admins can delete books"
ON books FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE (raw_user_meta_data->>'role') = 'admin'
  )
);

-- =====================================================
-- REVIEWS TABLE POLICIES
-- =====================================================

-- Everyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT
USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "Authenticated users can create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reviews, admins can delete any
CREATE POLICY "Users can delete own reviews, admins can delete any"
ON reviews FOR DELETE
USING (
  auth.uid() = user_id OR
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE (raw_user_meta_data->>'role') = 'admin'
  )
);

-- =====================================================
-- NOTES TABLE POLICIES
-- =====================================================

-- Users can only view their own notes
CREATE POLICY "Users can view own notes"
ON notes FOR SELECT
USING (auth.uid() = user_id);

-- Students, teachers, and admins can create notes
CREATE POLICY "Students+ can create notes"
ON notes FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE (raw_user_meta_data->>'role') IN ('student', 'teacher', 'admin')
  )
);

-- Users can update their own notes
CREATE POLICY "Users can update own notes"
ON notes FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete own notes"
ON notes FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- CHAT_MESSAGES TABLE POLICIES
-- =====================================================

-- Users can only view their own chat messages
CREATE POLICY "Users can view own chat messages"
ON chat_messages FOR SELECT
USING (auth.uid() = user_id);

-- Students, teachers, and admins can create chat messages
CREATE POLICY "Students+ can create chat messages"
ON chat_messages FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE (raw_user_meta_data->>'role') IN ('student', 'teacher', 'admin')
  )
);

-- Users can update their own chat messages
CREATE POLICY "Users can update own chat messages"
ON chat_messages FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own chat messages
CREATE POLICY "Users can delete own chat messages"
ON chat_messages FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT (raw_user_meta_data->>'role') = required_role
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION auth.user_has_any_role(required_roles text[])
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT (raw_user_meta_data->>'role') = ANY(required_roles)
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USAGE TRACKING (Optional - for analytics)
-- =====================================================

-- Create table for tracking AI usage
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type text NOT NULL, -- 'chat', 'summary', 'tts', 'questions'
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage logs
CREATE POLICY "Users can view own usage logs"
ON ai_usage_logs FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all usage logs
CREATE POLICY "Admins can view all usage logs"
ON ai_usage_logs FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE (raw_user_meta_data->>'role') = 'admin'
  )
);

-- System can insert usage logs (via service role)
CREATE POLICY "Service role can insert usage logs"
ON ai_usage_logs FOR INSERT
WITH CHECK (true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
