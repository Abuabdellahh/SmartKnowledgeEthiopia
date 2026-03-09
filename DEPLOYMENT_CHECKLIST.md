# Deployment Checklist - SKE RBAC & Voice Features

## Pre-Deployment

### 1. Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set (for Edge Functions)
- [ ] `GROQ_API_KEY` is set
- [ ] `GEMINI_API_KEY` is set
- [ ] `HUGGINGFACE_API_KEY` is set

### 2. Database Setup
- [ ] Supabase project is created
- [ ] Database connection is working
- [ ] Initial schema is applied (`001_initial_schema.sql`)

### 3. Code Review
- [ ] All TypeScript files compile without errors
- [ ] No console errors in development
- [ ] All imports are correct
- [ ] Environment variables are not hardcoded

## Database Migration

### Apply RLS Policies
```bash
# Connect to your Supabase database
psql postgresql://postgres:9vnX4G4TH*bL@g.@db.mpblwrvmfcluoznvvwes.supabase.co:5432/postgres \
  -f supabase/migrations/002_rbac_policies.sql
```

- [ ] RLS policies applied successfully
- [ ] No SQL errors
- [ ] Tables have RLS enabled
- [ ] Helper functions created

### Update Existing Users
```sql
-- Run this in Supabase SQL Editor
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"student"'
)
WHERE raw_user_meta_data->>'role' IS NULL;
```

- [ ] Existing users have roles assigned
- [ ] Verify with: `SELECT email, raw_user_meta_data->>'role' FROM auth.users;`

### Create Usage Logs Table
```sql
-- Should be in migration, but verify it exists
SELECT * FROM ai_usage_logs LIMIT 1;
```

- [ ] Table exists
- [ ] RLS policies are active

## Edge Functions Deployment

### Deploy Text-to-Speech Function
```bash
cd supabase/functions
supabase functions deploy text-to-speech
```

- [ ] Function deployed successfully
- [ ] No deployment errors
- [ ] Function appears in Supabase dashboard

### Test Edge Function
```bash
curl -i --location --request POST \
  'https://mpblwrvmfcluoznvvwes.supabase.co/functions/v1/text-to-speech' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"text":"Hello world"}'
```

- [ ] Function responds (even if unauthorized)
- [ ] CORS headers present
- [ ] No 500 errors

### Verify Other Edge Functions
- [ ] `ai-chat` is deployed
- [ ] `ai-sidebar-tools` is deployed
- [ ] `ai-reading-tools` is deployed
- [ ] `ai-summarize` is deployed

## Frontend Deployment

### Build Test
```bash
npm run build
```

- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No missing dependencies
- [ ] Build output looks correct

### Deploy to Vercel/Netlify
```bash
# For Vercel
vercel deploy --prod

# For Netlify
netlify deploy --prod
```

- [ ] Deployment successful
- [ ] Environment variables set in platform
- [ ] Domain configured
- [ ] SSL certificate active

## Post-Deployment Testing

### 1. Guest User Flow
- [ ] Visit homepage
- [ ] Browse books works
- [ ] View book details works
- [ ] AI features are hidden/disabled
- [ ] Voice reading is disabled
- [ ] Signup link works

### 2. Student Signup & Login
- [ ] Navigate to `/signup`
- [ ] Role selection appears
- [ ] Select "Student" role
- [ ] Enter email and password
- [ ] Signup succeeds
- [ ] Redirected to `/dashboard`
- [ ] Dashboard shows "Student" badge
- [ ] Stats cards display
- [ ] AI features are enabled

### 3. Student Features
- [ ] Navigate to `/chat`
- [ ] AI chat works
- [ ] Navigate to `/books`
- [ ] AI sidebar appears
- [ ] Voice button is enabled
- [ ] Click voice button - audio plays
- [ ] Navigate to `/reading`
- [ ] Upload document works
- [ ] AI tools work
- [ ] Voice reading works

### 4. Teacher Signup & Login
- [ ] Signup as teacher
- [ ] Dashboard shows "Teacher" badge
- [ ] All student features work
- [ ] Additional teacher features visible

### 5. Admin Access
- [ ] Manually set user to admin:
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"admin"'
)
WHERE email = 'your-admin@email.com';
```
- [ ] Login as admin
- [ ] Dashboard shows "Admin" badge
- [ ] Navigate to `/admin`
- [ ] Admin dashboard loads
- [ ] Can view all books
- [ ] Can add new book
- [ ] Can view reviews
- [ ] Can view analytics

### 6. Security Testing
- [ ] Guest cannot access `/dashboard` (redirects to login)
- [ ] Guest cannot call AI Edge Functions (401/403)
- [ ] Student cannot access `/admin` (redirects)
- [ ] Users can only see their own notes
- [ ] Users can only see their own chat messages
- [ ] RLS policies are enforced

### 7. Voice Reading Testing
- [ ] Browser speech synthesis works
- [ ] Play button starts reading
- [ ] Pause button pauses
- [ ] Stop button stops
- [ ] Speed slider changes speed
- [ ] Works on different browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

### 8. Mobile Testing
- [ ] Responsive design works
- [ ] Navigation menu works
- [ ] Dashboard displays correctly
- [ ] AI sidebar is accessible
- [ ] Voice reading works on mobile
- [ ] Touch controls work

## Monitoring Setup

### Supabase Dashboard
- [ ] Check Edge Function logs
- [ ] Monitor database performance
- [ ] Review RLS policy hits
- [ ] Check storage usage

### Application Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor API response times
- [ ] Track user signups
- [ ] Monitor feature usage

### Analytics
- [ ] Google Analytics configured (if using)
- [ ] Track page views
- [ ] Track feature usage
- [ ] Track conversion rates

## Documentation

- [ ] `RBAC_IMPLEMENTATION.md` is up to date
- [ ] `QUICK_START.md` is accessible
- [ ] `IMPLEMENTATION_SUMMARY.md` is complete
- [ ] README.md includes new features
- [ ] API documentation is updated

## Rollback Plan

### If Issues Occur

1. **Revert Database Changes**
```sql
-- Disable RLS if causing issues
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
```

2. **Revert Frontend**
```bash
# Redeploy previous version
vercel rollback
```

3. **Disable Edge Functions**
```bash
# In Supabase dashboard, disable problematic functions
```

## Success Criteria

### Must Have (Blocking)
- [ ] Users can sign up and login
- [ ] Dashboard loads after login
- [ ] Role-based features work
- [ ] No critical errors in console
- [ ] Database queries work
- [ ] RLS policies don't block legitimate access

### Should Have (Important)
- [ ] Voice reading works
- [ ] AI sidebar functions
- [ ] Admin panel accessible
- [ ] Mobile responsive
- [ ] Fast page loads

### Nice to Have (Optional)
- [ ] Perfect voice quality
- [ ] All browsers supported
- [ ] Offline functionality
- [ ] Advanced analytics

## Final Checks

- [ ] All tests pass
- [ ] No console errors
- [ ] No broken links
- [ ] Images load correctly
- [ ] Forms submit correctly
- [ ] Navigation works
- [ ] Search works
- [ ] Performance is acceptable
- [ ] Security is verified
- [ ] Documentation is complete

## Sign-Off

- [ ] Developer tested: _________________ Date: _______
- [ ] QA tested: _________________ Date: _______
- [ ] Product owner approved: _________________ Date: _______
- [ ] Deployed to production: _________________ Date: _______

## Post-Launch

### Week 1
- [ ] Monitor error rates
- [ ] Check user feedback
- [ ] Review analytics
- [ ] Fix critical bugs

### Week 2-4
- [ ] Optimize performance
- [ ] Improve based on feedback
- [ ] Add requested features
- [ ] Update documentation

### Ongoing
- [ ] Regular security updates
- [ ] Monitor usage patterns
- [ ] Optimize costs
- [ ] Plan new features

---

**Deployment Date**: ______________
**Deployed By**: ______________
**Version**: 1.0.0
**Status**: ☐ Ready ☐ In Progress ☐ Complete
