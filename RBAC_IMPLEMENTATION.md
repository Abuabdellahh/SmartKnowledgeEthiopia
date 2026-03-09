# Role-Based Access Control (RBAC) Implementation

## Overview

Smart Knowledge Ethiopia (SKE) now implements comprehensive role-based access control with four user roles:

- **Guest/Visitor**: Browse books, view AI summaries (read-only)
- **Student/Researcher**: Full AI tools + voice reading
- **Teacher/Educator**: All student permissions + moderation tools
- **Admin**: Full control, access to all AI and management features

## User Roles

### Guest (Unauthenticated)
- ✅ Browse books
- ✅ View book details
- ✅ View reviews
- ❌ No AI chat
- ❌ No voice reading
- ❌ No uploads
- ❌ No notes

### Student
- ✅ All guest permissions
- ✅ AI Chat Assistant
- ✅ AI Summaries
- ✅ AI Question Generator
- ✅ Voice Reading (TTS)
- ✅ Create notes
- ✅ Submit reviews
- ❌ No admin access

### Teacher
- ✅ All student permissions
- ✅ View analytics
- ✅ Moderate reviews
- ❌ No full admin access

### Admin
- ✅ All permissions
- ✅ Manage books
- ✅ Manage users
- ✅ View all analytics
- ✅ Access admin dashboard

## Implementation Details

### 1. User Metadata Storage

Roles are stored in `auth.user_metadata.role`:

```typescript
// During signup
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { role: "student" } // or "teacher"
  }
})
```

### 2. Frontend Role Checking

Use the `useUserRole` hook:

```typescript
import { useUserRole } from "@/lib/useUserRole"

function MyComponent() {
  const { role, email, loading } = useUserRole()
  
  if (role === "student") {
    // Show student features
  }
}
```

### 3. Supabase RLS Policies

Run the migration:

```bash
psql $DATABASE_URL -f supabase/migrations/002_rbac_policies.sql
```

Key policies:
- Books: Everyone can read, only admins can write
- Reviews: Authenticated users can create, users can edit their own
- Notes: Users can only see their own notes
- Chat Messages: Users can only see their own messages

### 4. Edge Functions Security

All Edge Functions validate user role:

```typescript
// Check user role
const userRole = user.user_metadata?.role || "guest"
if (!["student", "teacher", "admin"].includes(userRole)) {
  return new Response(
    JSON.stringify({ error: "Unauthorized" }),
    { status: 403 }
  )
}
```

## Features by Role

### AI Sidebar

Located at `/components/ai/AISidebar.tsx`

Features:
- AI Chat (context-aware)
- AI Explanation
- AI Summary Generator
- AI Question Generator
- Voice Reading Toggle

Access: Students, Teachers, Admins only

### Voice Reading (TTS)

Located at `/lib/useTextToSpeech.ts`

Features:
- Browser-native speech synthesis
- Play/pause controls
- Reads book pages and AI outputs

Access: Students, Teachers, Admins only

### Dashboard

Located at `/app/dashboard/page.tsx`

Features:
- User stats (books read, AI queries, voice minutes)
- Role-based feature display
- Quick actions
- Recent books

Access: All authenticated users

### Admin Panel

Located at `/app/admin/page.tsx`

Features:
- Manage books
- Manage reviews
- View analytics
- System status

Access: Admins only

## Setup Instructions

### 1. Apply Database Migrations

```bash
# Connect to your Supabase database
psql $DATABASE_URL -f supabase/migrations/002_rbac_policies.sql
```

### 2. Deploy Edge Functions

```bash
# Deploy TTS function
supabase functions deploy text-to-speech

# Deploy AI sidebar tools (if not already deployed)
supabase functions deploy ai-sidebar-tools
```

### 3. Environment Variables

Ensure these are set in `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Provider Keys
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
HUGGINGFACE_API_KEY=your_hf_key
```

### 4. Update Existing Users

For existing users without roles:

```sql
-- Set default role for existing users
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"student"'
)
WHERE raw_user_meta_data->>'role' IS NULL;
```

## Testing

### Test Role Assignment

1. Sign up as a new user
2. Select "Student" or "Teacher" role
3. Verify role badge appears on dashboard
4. Test feature access based on role

### Test AI Features

1. Login as student
2. Navigate to a book page
3. Open AI sidebar
4. Test chat, summary, and voice reading

### Test Admin Access

1. Manually set a user to admin:
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"admin"'
)
WHERE email = 'admin@example.com';
```

2. Login and access `/admin`
3. Verify all admin features work

## Security Best Practices

1. **Never trust client-side role checks alone**
   - Always validate on the server (Edge Functions)
   - Use RLS policies for database access

2. **Audit logs**
   - All AI usage is logged in `ai_usage_logs`
   - Track feature usage per user

3. **Rate limiting**
   - Consider implementing rate limits for AI features
   - Prevent abuse of TTS and chat features

4. **API key security**
   - Never expose API keys in client code
   - Use Edge Functions for all AI API calls

## Troubleshooting

### Users stuck as "guest"

Check if role is set in user metadata:
```sql
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users;
```

### RLS policies blocking access

Temporarily disable RLS for testing:
```sql
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
```

Remember to re-enable after testing!

### Edge Functions not validating roles

Check function logs:
```bash
supabase functions logs text-to-speech
```

## Future Enhancements

1. **Role hierarchy**
   - Implement role inheritance
   - Teachers inherit student permissions automatically

2. **Custom permissions**
   - Fine-grained permissions per feature
   - User groups and teams

3. **Usage quotas**
   - Limit AI queries per role
   - Premium tiers with higher limits

4. **Advanced TTS**
   - Integrate Google Cloud TTS
   - Multiple voice options
   - Language selection

## Support

For issues or questions:
- Check the logs: `supabase functions logs`
- Review RLS policies: `supabase/migrations/002_rbac_policies.sql`
- Test with different roles
- Contact: eibrahim9961@gmail.com
