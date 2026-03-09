# Smart Knowledge Ethiopia - RBAC & Voice Reading Implementation

## 🎉 What's New

Your Smart Knowledge Ethiopia platform now includes:

1. **Role-Based Access Control (RBAC)** - Four user roles with different permissions
2. **User Dashboard** - Personalized dashboard after login
3. **Enhanced AI Sidebar** - Collapsible sidebar with voice reading
4. **Voice Reading Feature** - Text-to-speech for books and documents
5. **Secure Database** - Row-level security policies
6. **Usage Tracking** - Analytics for AI feature usage

## 🚀 Quick Start

### For Users

1. **Sign Up**: Visit `/signup` and choose your role (Student or Teacher)
2. **Dashboard**: After login, you'll see your personalized dashboard at `/dashboard`
3. **AI Features**: Navigate to any book or `/reading` to use AI tools
4. **Voice Reading**: Click the 🔊 button to hear content read aloud

### For Developers

1. **Apply Database Migrations**:
```bash
psql $DATABASE_URL -f supabase/migrations/002_rbac_policies.sql
```

2. **Deploy Edge Functions**:
```bash
supabase functions deploy text-to-speech
```

3. **Build and Deploy**:
```bash
npm run build
vercel deploy --prod
```

See `DEPLOYMENT_CHECKLIST.md` for complete deployment steps.

## 📚 Documentation

- **[RBAC Implementation Guide](./RBAC_IMPLEMENTATION.md)** - Complete technical documentation
- **[Quick Start Guide](./QUICK_START.md)** - User guide for all features
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Overview of all changes
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment guide

## 👥 User Roles

### Guest (Unauthenticated)
- Browse books and view details
- View reviews
- **Cannot** use AI features or voice reading

### Student
- All guest permissions
- AI Chat, Summaries, Questions
- Voice Reading (TTS)
- Create notes and reviews

### Teacher
- All student permissions
- View analytics
- Moderate reviews

### Admin
- All permissions
- Manage books and users
- Access admin dashboard
- View all analytics

## 🎯 Key Features

### 1. Dashboard (`/dashboard`)
- Welcome message with role badge
- Usage statistics (books read, AI queries, voice minutes)
- Role-based feature cards
- Quick action buttons
- Recent books section

### 2. AI Sidebar
- **Chat**: Ask questions about current content
- **Explain**: Get detailed explanations
- **Summary**: Quick summaries
- **Questions**: Generate study questions
- **Voice Toggle**: Hear AI responses

### 3. Voice Reading
- Browser-native text-to-speech
- Play/Pause/Stop controls
- Speed adjustment (0.5x - 2.0x)
- Progress indicator
- Works on book pages and documents

### 4. Security
- Row-level security (RLS) on all tables
- Role validation in Edge Functions
- Usage logging for analytics
- Private notes and messages

## 🏗️ Architecture

### Frontend
```
app/
├── dashboard/page.tsx          # New dashboard
├── login/LoginClient.tsx       # Redirects to dashboard
├── signup/page.tsx             # Role selection
└── reading/page.tsx            # Voice reading integrated

components/
├── ai/AISidebar.tsx            # Enhanced with voice
├── reading/VoiceReader.tsx     # New voice component
└── navigation.tsx              # Role-based navigation

lib/
├── useUserRole.ts              # Role management
└── useTextToSpeech.ts          # TTS functionality
```

### Backend
```
supabase/
├── functions/
│   └── text-to-speech/         # New TTS endpoint
└── migrations/
    └── 002_rbac_policies.sql   # RLS policies
```

## 🔐 Security

### Database (RLS Policies)
- **Books**: Everyone reads, admins write
- **Reviews**: Users manage own, admins moderate
- **Notes**: Private per user
- **Chat Messages**: Private per user

### Edge Functions
- Validate user authentication
- Check user role
- Log usage for analytics
- Return appropriate errors

### Frontend
- Role checks in components
- Conditional rendering
- Disabled states for unauthorized features
- Clear messaging

## 📊 Usage Tracking

All AI feature usage is logged in `ai_usage_logs`:
- User ID
- Feature type (chat, summary, tts, questions)
- Tokens used
- Timestamp

Accessible by:
- Users (their own data)
- Admins (all data)

## 🧪 Testing

### Manual Testing
1. Sign up as different roles
2. Verify dashboard access
3. Test AI features per role
4. Try voice reading
5. Check admin panel (admin only)

### Security Testing
1. Try accessing `/admin` as student (should redirect)
2. Try calling Edge Functions as guest (should fail)
3. Try viewing other users' notes (should fail)

See `DEPLOYMENT_CHECKLIST.md` for complete testing checklist.

## 🐛 Troubleshooting

### Users Stuck as Guest
```sql
-- Check user roles
SELECT email, raw_user_meta_data->>'role' FROM auth.users;

-- Set role manually
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"student"'
)
WHERE email = 'user@example.com';
```

### Voice Reading Not Working
- Check browser compatibility (Chrome, Edge, Safari recommended)
- Verify user role (must be student, teacher, or admin)
- Check browser audio permissions
- Try different browser

### RLS Blocking Access
```sql
-- Temporarily disable for testing
ALTER TABLE books DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
```

## 📈 Future Enhancements

### Planned Features
1. **Google Cloud TTS** - Better voice quality
2. **Multiple Languages** - Amharic, Tigrinya voices
3. **Usage Quotas** - Limit AI queries per role
4. **Premium Tiers** - Advanced features for paid users
5. **Offline TTS** - Pre-generated audio files
6. **Voice Selection** - Multiple voice options

### Improvements
1. Role hierarchy (teachers inherit student permissions)
2. Custom permissions per feature
3. User groups and teams
4. Advanced analytics dashboard
5. Rate limiting for AI features

## 🤝 Contributing

### Adding New Roles
1. Update `UserRole` type in `lib/useUserRole.ts`
2. Add role to signup form
3. Update RLS policies
4. Add role checks in components
5. Update documentation

### Adding New AI Features
1. Create Edge Function with role validation
2. Add UI component with role check
3. Update AI sidebar if needed
4. Add usage logging
5. Update documentation

## 📞 Support

- **Email**: eibrahim9961@gmail.com
- **Documentation**: See files in project root
- **Issues**: Check Supabase logs and browser console

## 📝 License

[Your License Here]

## 🙏 Acknowledgments

- Next.js for the framework
- Supabase for backend and auth
- Shadcn/ui for components
- Groq, Gemini, HuggingFace for AI APIs

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅

## 📋 Quick Links

- [User Guide](./QUICK_START.md)
- [Technical Docs](./RBAC_IMPLEMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_CHECKLIST.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

---

Made with ❤️ for Ethiopian learners 🇪🇹
