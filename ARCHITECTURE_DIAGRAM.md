# System Architecture - RBAC & Voice Reading

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Homepage   │  │   Dashboard  │  │  Admin Panel │         │
│  │      /       │  │  /dashboard  │  │    /admin    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Books     │  │   AI Chat    │  │   Reading    │         │
│  │   /books     │  │    /chat     │  │   /reading   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              COMPONENTS                              │       │
│  ├─────────────────────────────────────────────────────┤       │
│  │  • Navigation (role-based)                          │       │
│  │  • AI Sidebar (with voice toggle)                   │       │
│  │  • Voice Reader (play/pause/speed)                  │       │
│  │  • Book Cards, Review Forms, etc.                   │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              HOOKS & UTILITIES                       │       │
│  ├─────────────────────────────────────────────────────┤       │
│  │  • useUserRole() - Role management                  │       │
│  │  • useTextToSpeech() - Voice reading                │       │
│  │  • supabaseClient - Database connection             │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              AUTHENTICATION                          │       │
│  ├─────────────────────────────────────────────────────┤       │
│  │  • Email/Password                                    │       │
│  │  • OAuth (Google, Apple)                             │       │
│  │  • User Metadata (role storage)                      │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              DATABASE (PostgreSQL)                   │       │
│  ├─────────────────────────────────────────────────────┤       │
│  │  Tables:                                             │       │
│  │  • books (RLS: read all, write admin)               │       │
│  │  • reviews (RLS: users own, admins all)             │       │
│  │  • notes (RLS: private per user)                    │       │
│  │  • chat_messages (RLS: private per user)            │       │
│  │  • ai_usage_logs (RLS: users own, admins all)       │       │
│  │  • reading_documents, reading_chunks                │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              EDGE FUNCTIONS                          │       │
│  ├─────────────────────────────────────────────────────┤       │
│  │  • text-to-speech (role: student+)                  │       │
│  │  • ai-chat (role: student+)                         │       │
│  │  • ai-sidebar-tools (role: student+)                │       │
│  │  • ai-reading-tools (role: student+)                │       │
│  │  • ai-summarize (role: student+)                    │       │
│  │  • generate-embeddings (role: student+)             │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              STORAGE                                 │       │
│  ├─────────────────────────────────────────────────────┤       │
│  │  • book-covers/                                      │       │
│  │  • reading-documents/                                │       │
│  │  • user-uploads/                                     │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL AI SERVICES                        │
├─────────────────────────────────────────────────────────────────┤
│  • Groq API (Chat)                                               │
│  • Gemini API (Summaries, Questions)                             │
│  • HuggingFace API (Embeddings)                                  │
│  • Browser Speech Synthesis (TTS)                                │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Role-Based Access Flow

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│         Sign Up / Login                   │
│  • Select role (student/teacher)          │
│  • Role stored in user_metadata           │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│         Dashboard (/dashboard)            │
│  • Show role badge                        │
│  • Display available features             │
│  • Show usage stats                       │
└──────┬───────────────────────────────────┘
       │
       ├─────────────┬─────────────┬─────────────┐
       ▼             ▼             ▼             ▼
   ┌───────┐   ┌─────────┐   ┌─────────┐   ┌────────┐
   │ Guest │   │ Student │   │ Teacher │   │ Admin  │
   └───┬───┘   └────┬────┘   └────┬────┘   └───┬────┘
       │            │              │            │
       ▼            ▼              ▼            ▼
   Browse       Browse         Browse       Browse
   Books        Books          Books        Books
       │            │              │            │
       ✗            ▼              ▼            ▼
   No AI        AI Chat        AI Chat      AI Chat
   Features     AI Sidebar     AI Sidebar   AI Sidebar
       │            │              │            │
       ✗            ▼              ▼            ▼
   No Voice     Voice          Voice        Voice
   Reading      Reading        Reading      Reading
       │            │              │            │
       ✗            ▼              ▼            ▼
   No Notes     Create         Create       Create
                Notes          Notes        Notes
       │            │              │            │
       ✗            ✗              ▼            ▼
   No Admin     No Admin       Analytics    Admin
   Access       Access         Dashboard    Dashboard
```

## 🎵 Voice Reading Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    User Action                                │
│              (Click voice/speaker icon)                       │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Check User Role    │
         │  (useUserRole hook) │
         └─────────┬───────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
    ┌────────┐         ┌──────────┐
    │ Guest  │         │ Student+ │
    └───┬────┘         └────┬─────┘
        │                   │
        ▼                   ▼
    Show Upgrade      ┌──────────────────┐
    Message           │ useTextToSpeech  │
                      │      hook        │
                      └────┬─────────────┘
                           │
                           ▼
                  ┌─────────────────────┐
                  │ Browser Speech API  │
                  │  speechSynthesis    │
                  └────┬────────────────┘
                       │
                       ▼
                  ┌─────────────────────┐
                  │  Play Audio         │
                  │  • Adjustable speed │
                  │  • Pause/Resume     │
                  │  • Stop             │
                  └────┬────────────────┘
                       │
                       ▼
                  ┌─────────────────────┐
                  │  Log Usage          │
                  │  (ai_usage_logs)    │
                  └─────────────────────┘
```

## 🤖 AI Sidebar Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    User Opens Book/Reading Page               │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  AI Sidebar Loads   │
         │  (AISidebar.tsx)    │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Check User Role    │
         └─────────┬───────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
    ┌────────┐         ┌──────────┐
    │ Guest  │         │ Student+ │
    └───┬────┘         └────┬─────┘
        │                   │
        ▼                   ▼
    Disable All       Enable Tools:
    Tools             • Chat
                      • Explain
                      • Summary
                      • Questions
                      • Voice Toggle
                           │
                           ▼
                  ┌─────────────────────┐
                  │  User Selects Tool  │
                  └────┬────────────────┘
                       │
                       ▼
                  ┌─────────────────────┐
                  │  Call Edge Function │
                  │  (ai-sidebar-tools) │
                  └────┬────────────────┘
                       │
                       ▼
                  ┌─────────────────────┐
                  │  Validate Role      │
                  │  (in Edge Function) │
                  └────┬────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
    ┌────────┐                 ┌──────────┐
    │ Denied │                 │ Allowed  │
    └───┬────┘                 └────┬─────┘
        │                           │
        ▼                           ▼
    Return 403              Call AI API
    Error                   (Groq/Gemini)
                                   │
                                   ▼
                            ┌──────────────┐
                            │ Return Result│
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │ Display in   │
                            │ Sidebar      │
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │ Log Usage    │
                            │ (optional)   │
                            └──────────────┘
```

## 🗄️ Database Schema (Simplified)

```
┌─────────────────────────────────────────────────────────────┐
│                      auth.users                              │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                │
│ email (text)                                                 │
│ raw_user_meta_data (jsonb)                                   │
│   └─ role: "guest" | "student" | "teacher" | "admin"        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (user_id FK)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│    books      │    │    reviews    │    │     notes     │
├───────────────┤    ├───────────────┤    ├───────────────┤
│ id (uuid, PK) │    │ id (uuid, PK) │    │ id (uuid, PK) │
│ title         │    │ book_id (FK)  │    │ user_id (FK)  │
│ author        │    │ user_id (FK)  │    │ book_id (FK)  │
│ category_id   │    │ rating        │    │ content       │
│ ...           │    │ comment       │    │ ...           │
│               │    │ ...           │    │               │
│ RLS: Read All │    │ RLS: Own+Admin│    │ RLS: Own Only │
└───────────────┘    └───────────────┘    └───────────────┘

        ┌─────────────────────┐
        │   chat_messages     │
        ├─────────────────────┤
        │ id (uuid, PK)       │
        │ user_id (FK)        │
        │ message             │
        │ response            │
        │ ...                 │
        │                     │
        │ RLS: Own Only       │
        └─────────────────────┘

        ┌─────────────────────┐
        │   ai_usage_logs     │
        ├─────────────────────┤
        │ id (uuid, PK)       │
        │ user_id (FK)        │
        │ feature_type        │
        │ tokens_used         │
        │ created_at          │
        │                     │
        │ RLS: Own+Admin      │
        └─────────────────────┘
```

## 🔒 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Frontend (UI)                                      │
│  ├─ Role checks in components                                │
│  ├─ Conditional rendering                                    │
│  ├─ Disabled states                                          │
│  └─ Clear messaging                                          │
│                                                              │
│  Layer 2: Edge Functions (API)                               │
│  ├─ Authentication check                                     │
│  ├─ Role validation                                          │
│  ├─ Usage logging                                            │
│  └─ Error handling                                           │
│                                                              │
│  Layer 3: Database (RLS)                                     │
│  ├─ Row-level security policies                              │
│  ├─ Role-based access                                        │
│  ├─ Helper functions                                         │
│  └─ Audit trails                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Example: Voice Reading

```
1. User clicks voice button
   └─> Frontend: VoiceReader component

2. Check user role
   └─> useUserRole() hook
       └─> Returns: "student"

3. Role check passes
   └─> useTextToSpeech() hook
       └─> allowed = true

4. Get text content
   └─> From props or current page

5. Call browser API
   └─> window.speechSynthesis.speak()
       └─> Browser reads text aloud

6. Log usage (optional)
   └─> Call Edge Function
       └─> Insert into ai_usage_logs
           └─> RLS allows (user's own record)

7. User controls playback
   └─> Play/Pause/Stop buttons
       └─> Update UI state
           └─> Control speech synthesis
```

## 🎯 Component Hierarchy

```
App
├── Layout
│   ├── Navigation (role-based)
│   └── ThemeProvider
│
├── Pages
│   ├── / (Homepage)
│   ├── /dashboard (Dashboard) ← NEW
│   ├── /books (Books List)
│   ├── /books/[id] (Book Detail)
│   ├── /chat (AI Chat)
│   ├── /reading (Reading Assistant)
│   ├── /admin (Admin Panel)
│   ├── /login (Login)
│   └── /signup (Signup) ← MODIFIED
│
└── Components
    ├── AI
    │   └── AISidebar ← ENHANCED
    │
    ├── Reading
    │   └── VoiceReader ← NEW
    │
    ├── UI (shadcn/ui)
    │   ├── Button
    │   ├── Card
    │   ├── Input
    │   └── ...
    │
    └── Shared
        ├── Navigation
        ├── Footer
        ├── BookCard
        └── ...
```

---

This architecture ensures:
- ✅ Secure role-based access
- ✅ Scalable component structure
- ✅ Clear data flow
- ✅ Multiple security layers
- ✅ Easy to maintain and extend
