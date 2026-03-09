# Testing Guide - AI Research Assistant

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
```bash
# Check .env file has all required variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=gsk_your_groq_key
```

### 2. Deploy Edge Functions
```bash
# Deploy ai-chat function
supabase functions deploy ai-chat --no-verify-jwt

# Deploy quick-handler function
./deploy-quick-handler.sh

# Set secrets
supabase secrets set GROQ_API_KEY=your_key_here
```

### 3. Database Setup
```bash
# Run migrations
supabase db push

# Verify tables exist
supabase db diff
```

---

## 🧪 Manual Testing Steps

### Test 1: Authentication Flow
- [ ] Visit `/login`
- [ ] Sign in with test account
- [ ] Verify redirect to dashboard
- [ ] Check user role in UI (guest/student/teacher/admin)

### Test 2: Chat Page (Real AI)
- [ ] Navigate to `/chat`
- [ ] Type: "What are the main themes of Ethiopian history?"
- [ ] Click Send
- [ ] **Expected**: Real AI response from Groq API
- [ ] **Not Expected**: Mock response starting with "Ethiopian history encompasses..."
- [ ] Verify response time < 5 seconds
- [ ] Test with book context selected
- [ ] Test copy message button
- [ ] Test clear chat button

### Test 3: AI Sidebar
- [ ] Open any page with AISidebar component
- [ ] Click "Summarize" button
- [ ] **Expected**: Real summary from Groq API
- [ ] Test "Explain" tool
- [ ] Test "Quiz" tool
- [ ] Test "Flashcards" tool
- [ ] Test text-to-speech button
- [ ] Test sidebar resize (drag left edge)
- [ ] Test collapse/expand sidebar

### Test 4: Role-Based Access
- [ ] Test as guest (should see "AI tools available for students+")
- [ ] Test as student (should have full access)
- [ ] Test as teacher (should have full access)
- [ ] Test as admin (should have full access)

### Test 5: Error Handling
- [ ] Remove GROQ_API_KEY from Supabase secrets
- [ ] Try to use AI chat
- [ ] **Expected**: Error message about missing API key
- [ ] Restore GROQ_API_KEY
- [ ] Test with very long input (>2000 chars)
- [ ] **Expected**: Alert about max length
- [ ] Test with network disconnected
- [ ] **Expected**: Error message, not crash

### Test 6: Text-to-Speech
- [ ] Generate AI response
- [ ] Click speaker icon
- [ ] **Expected**: Browser reads text aloud
- [ ] Click stop icon
- [ ] **Expected**: Speech stops
- [ ] Navigate away during speech
- [ ] **Expected**: Speech stops (no memory leak)

### Test 7: Performance
- [ ] Open browser DevTools > Network
- [ ] Send chat message
- [ ] Verify only 1 API call to edge function
- [ ] Check response size < 50KB
- [ ] Test with 10 rapid clicks
- [ ] **Expected**: No duplicate requests

---

## 🐛 Common Issues & Fixes

### Issue: "GROQ_API_KEY not configured"
**Fix**: 
```bash
supabase secrets set GROQ_API_KEY=your_key_here
```

### Issue: "Edge function not found"
**Fix**:
```bash
supabase functions deploy ai-chat
supabase functions deploy quick-handler
```

### Issue: Mock responses still showing
**Fix**: Clear browser cache, verify ChatClient.tsx was updated

### Issue: Text-to-speech not working
**Fix**: Check browser supports Web Speech API (Chrome/Edge recommended)

### Issue: Sidebar not resizing
**Fix**: Check window width > 1024px (lg breakpoint)

---

## 📊 Performance Benchmarks

| Metric | Target | Acceptable |
|--------|--------|------------|
| Chat response time | < 3s | < 5s |
| Sidebar tool response | < 4s | < 6s |
| Page load time | < 2s | < 3s |
| Time to interactive | < 3s | < 5s |

---

## 🔒 Security Testing

- [ ] Verify guest users cannot access AI features
- [ ] Check Authorization header sent with all requests
- [ ] Verify CORS headers in edge functions
- [ ] Test SQL injection in chat input (should be safe)
- [ ] Test XSS in AI responses (should be sanitized)
- [ ] Verify API keys not exposed in client bundle

---

## 📱 Browser Compatibility

| Browser | Chat | Sidebar | TTS | Status |
|---------|------|---------|-----|--------|
| Chrome 120+ | ✅ | ✅ | ✅ | Fully supported |
| Firefox 120+ | ✅ | ✅ | ⚠️ | TTS limited |
| Safari 17+ | ✅ | ✅ | ⚠️ | TTS limited |
| Edge 120+ | ✅ | ✅ | ✅ | Fully supported |

---

## 🚀 Production Readiness

- [ ] All tests passing
- [ ] Error boundaries in place
- [ ] Loading states implemented
- [ ] Error messages user-friendly
- [ ] Analytics tracking added
- [ ] Rate limiting configured
- [ ] Monitoring/logging setup
- [ ] Backup strategy documented
- [ ] Rollback plan ready
