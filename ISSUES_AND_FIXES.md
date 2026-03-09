# AI Research Assistant - Issues & Fixes

## 🔴 Critical Issues

### 1. Chat Not Using Real AI
**File**: `app/chat/ChatClient.tsx`
**Line**: ~115
**Problem**: Using mock responses instead of calling Supabase Edge Function
**Status**: ❌ Not Working

**Current Code**:
```tsx
await new Promise((resolve) => setTimeout(resolve, 1500))
const aiResponse = generateMockResponse(input, contextInfo?.title)
```

**Fix Required**:
```tsx
const { data: { session } } = await supabase.auth.getSession()
const { data, error } = await supabase.functions.invoke("ai-chat", {
  body: { message: input, bookId: contextBook },
  headers: { Authorization: `Bearer ${session.access_token}` }
})
if (error) throw error
const aiResponse = {
  id: (Date.now() + 1).toString(),
  role: "assistant",
  content: data.answer,
  bookId: contextBook || undefined,
  timestamp: new Date().toISOString(),
}
```

---

### 2. AISidebar Missing Edge Function
**File**: `components/ai/AISidebar.tsx`
**Line**: 62
**Problem**: Calling non-existent "quick-handler" function
**Status**: ❌ Will Fail

**Available Functions**:
- `ai-chat` - For chat messages
- `ai-summarize` - For summarization
- `ai-reading-tools` - For reading tools
- `ai-sidebar-tools` - For sidebar tools (if exists)

**Fix**: Create the missing edge function or use existing ones

---

### 3. Missing Environment Variables Check
**Problem**: No validation that required env vars are set
**Impact**: Silent failures in production

**Fix**: Add to `lib/supabaseClient.ts`:
```tsx
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
  throw new Error("Supabase configuration error")
}
```

---

### 4. No Input Length Validation
**File**: `app/chat/ChatClient.tsx`
**Problem**: No max length check on user input
**Impact**: Could exceed API limits

**Fix**:
```tsx
const MAX_INPUT_LENGTH = 2000

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!input.trim() || isLoading || !aiAllowed) return
  
  if (input.length > MAX_INPUT_LENGTH) {
    // Show error toast
    return
  }
  // ... rest of code
}
```

---

### 5. Text-to-Speech Memory Leak
**File**: `components/ai/AISidebar.tsx`
**Problem**: No cleanup when component unmounts during speech
**Impact**: Speech continues after navigation

**Fix**:
```tsx
useEffect(() => {
  return () => {
    if (isSpeaking) {
      stop()
      setIsSpeaking(false)
    }
  }
}, [isSpeaking, stop])
```

---

## 🟡 Medium Priority Issues

### 6. No Error Boundaries
**Problem**: No React Error Boundaries to catch errors
**Impact**: Entire app crashes on component errors

**Fix**: Create `components/ErrorBoundary.tsx`:
```tsx
"use client"
import { Component, ReactNode } from "react"

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>
    }
    return this.props.children
  }
}
```

---

### 7. No Rate Limiting
**Problem**: No client-side rate limiting for AI requests
**Impact**: Could exceed API quotas quickly

**Fix**: Add debouncing and request tracking

---

### 8. Missing Loading Skeletons
**Problem**: Shows "Checking access..." as plain text
**Impact**: Poor UX during loading

**Fix**: Use skeleton components from shadcn/ui

---

## 🟢 Best Practice Improvements

### 9. Hardcoded Strings
**Problem**: UI text hardcoded in components
**Fix**: Create `lib/constants.ts` for all strings

### 10. No Analytics
**Problem**: No tracking of AI usage
**Fix**: Add event tracking for AI interactions

### 11. No Caching
**Problem**: Same questions re-fetch from API
**Fix**: Use React Query cache properly

### 12. Accessibility
**Problem**: Missing ARIA labels on some interactive elements
**Fix**: Add proper ARIA attributes

---

## 📋 Testing Checklist

- [ ] Test with GROQ_API_KEY set
- [ ] Test with GROQ_API_KEY missing
- [ ] Test as guest user
- [ ] Test as student user
- [ ] Test with very long input
- [ ] Test network failure scenarios
- [ ] Test rapid clicking on AI buttons
- [ ] Test text-to-speech on mobile
- [ ] Test sidebar resize limits
- [ ] Test with slow network (throttling)

---

## 🚀 Deployment Checklist

- [ ] All environment variables set in production
- [ ] Edge functions deployed to Supabase
- [ ] CORS headers configured correctly
- [ ] Rate limiting configured
- [ ] Error monitoring setup (Sentry/LogRocket)
- [ ] Analytics configured
- [ ] Database policies tested
- [ ] SSL certificates valid
- [ ] CDN configured for static assets
- [ ] Backup strategy in place

---

## 📊 Performance Optimization

1. **Code Splitting**: Lazy load AI components
2. **Image Optimization**: Use Next.js Image component
3. **Bundle Size**: Analyze with `next build --analyze`
4. **API Response Time**: Monitor edge function latency
5. **Database Queries**: Add indexes for common queries

---

## 🔒 Security Hardening

1. **Input Sanitization**: Sanitize all user inputs
2. **XSS Prevention**: Use DOMPurify for rendered content
3. **CSRF Protection**: Verify in Supabase settings
4. **API Key Rotation**: Regular rotation schedule
5. **Audit Logs**: Track all AI usage for compliance
