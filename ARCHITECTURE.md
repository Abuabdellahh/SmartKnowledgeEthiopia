# Smart Knowledge Ethiopia — Architecture

## 1. Project overview

**Smart Knowledge Ethiopia (SKE)** is an AI-powered national knowledge platform that helps Ethiopian students, researchers, and citizens access books, research materials, and AI-assisted learning tools.

### Problem

- Limited physical and digital access to quality educational content.
- Need for tools that support understanding (summaries, Q&A) and discovery (semantic search).
- Desire for a single, trustworthy platform for learning and research.

### Solution

- **Catalog**: Books and categories stored in Supabase (PostgreSQL).
- **AI summary**: One-click Gemini-generated summaries per book.
- **AI Q&A**: Groq-powered chat about a specific book using its metadata/summary as context.
- **Semantic search**: HuggingFace embeddings + pgvector for meaning-based book search.
- **Sentiment on reviews**: HuggingFace-based classification (positive/neutral/negative) for moderation and analytics.

---

## 2. System architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Next.js (App Router)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │   Pages /    │  │ Server       │  │ TanStack     │  │ Auth        │  │
│  │   UI         │  │ Actions      │  │ Query        │  │ Context     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘  │
│         │                 │                 │                 │         │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Supabase (BaaS)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ PostgreSQL   │  │ Auth         │  │ Storage      │  │ Edge        │  │
│  │ (books,      │  │ (email/pw,   │  │ (covers,     │  │ Functions   │  │
│  │  reviews,    │  │  profiles)   │  │  files)      │  │ (optional)  │  │
│  │  embeddings) │  │              │  │              │  │             │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────┬──────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                                                  │
          ┌────────────────────────┬──────────────────────────────┘
          ▼                         ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Groq API         │    │ Google Gemini    │    │ HuggingFace      │
│ (chat / Q&A)     │    │ (summarization)  │    │ (embeddings,     │
│                  │    │                  │    │  sentiment)      │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Data flow

- **Frontend**: Next.js App Router, React Server Components where useful, client components for forms and real-time UI.
- **Data fetching**: TanStack Query for client-side caching and mutations (books, reviews, chat sessions/messages).
- **Auth**: Supabase Auth (email/password). Session in cookies; `createServerSupabaseClient()` and middleware keep session in sync. `AuthProvider` + `useAuth()` expose user and profile.
- **Database**: All tables in Supabase (PostgreSQL). RLS policies enforce: public read for books/categories; authenticated write for reviews and chat; admin-only for books/categories/embeddings.
- **AI**: Server Actions call Groq, Gemini, and HuggingFace from the Next.js server. API keys live in env (server-only). Optional: same logic can run inside Supabase Edge Functions for a fully serverless path.

---

## 3. Project folder structure

```
SKE/
├── src/
│   ├── app/
│   │   ├── (app)/                    # Main app routes (with header/footer)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Home
│   │   │   ├── explore/page.tsx      # Book explorer
│   │   │   ├── books/[slug]/page.tsx # Book detail + summary + reviews
│   │   │   ├── chat/page.tsx         # AI chat (protected)
│   │   │   ├── admin/page.tsx        # Admin dashboard (protected, role-gated)
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── actions/                  # Server Actions
│   │   │   ├── ai-summary.ts         # Gemini book summary
│   │   │   ├── ai-chat.ts            # Groq book Q&A
│   │   │   ├── semantic-search.ts   # HuggingFace + pgvector
│   │   │   ├── sentiment.ts          # Review sentiment
│   │   │   └── review.ts             # Post review with sentiment
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── auth/RequireAuth.tsx
│   │   ├── layout/Header.tsx
│   │   └── providers/Providers.tsx
│   ├── hooks/
│   │   ├── useBooks.ts               # useBooks, useBookDetails, useCategories
│   │   ├── useReviews.ts             # useReviews, usePostReview
│   │   ├── useAIChat.ts              # useChatSessions, useChatMessages, useSendChatMessage
│   │   └── index.ts
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── AuthContext.tsx
│   │   │   └── actions.ts            # signIn, signUp, signOut
│   │   └── supabase/
│   │       ├── client.ts             # Browser client
│   │       ├── server.ts              # Server client (RSC/actions)
│   │       └── middleware.ts         # Session refresh
│   ├── types/index.ts
│   └── middleware.ts                 # Runs Supabase session update
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── functions/
│       ├── ai-chat/index.ts
│       ├── ai-summarize/index.ts
│       └── generate-embeddings/index.ts
├── .env.example
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── ARCHITECTURE.md (this file)
```

---

## 4. Database schema (Supabase SQL)

See `supabase/migrations/001_initial_schema.sql`. Summary:

| Table           | Purpose |
|----------------|---------|
| `profiles`     | Extends `auth.users`; role (student/researcher/admin). |
| `categories`   | Hierarchical categories for books. |
| `books`        | Title, author, description, cover_url, file_url, category_id, summary, etc. |
| `reviews`      | book_id, user_id, rating, content, sentiment. |
| `chat_sessions`| user_id, optional book_id, title. |
| `chat_messages`| session_id, role, content. |
| `embeddings`   | book_id, chunk_index, content, embedding vector(384). |

RPC: `match_books_by_embedding(query_embedding, match_threshold, match_count)` for semantic search.

---

## 5. Supabase Auth

- **Sign up**: `signUp(email, password, fullName)`. Supabase sends confirmation email if enabled.
- **Sign in**: `signIn(email, password)`. Session stored in cookies via `@supabase/ssr`.
- **Session**: Middleware runs on each request and refreshes the session; `createServerSupabaseClient()` and browser `createClient()` use the same session.
- **Protected routes**: Wrap pages with `<RequireAuth>`. It uses `useAuth()`; if no user, redirects to `/login?redirect=...`.
- **Profile**: Trigger `handle_new_user()` creates a row in `profiles` on signup. Role defaults to `student`; admins are set manually in DB or via a future admin UI.

---

## 6. AI features

| Feature              | Provider   | Flow |
|----------------------|-----------|------|
| **AI book summary**  | Gemini    | User clicks “Generate AI summary” → Server Action fetches book, calls Gemini, saves to `books.summary`. |
| **Book Q&A**         | Groq      | User asks question in chat → Action builds context from book (title, author, description, summary), calls Groq, appends user + assistant messages to `chat_messages`. |
| **Semantic search**  | HuggingFace + pgvector | User query → Action gets embedding from HF → RPC `match_books_by_embedding` returns book IDs by similarity. |
| **Review sentiment** | HuggingFace | On submit review → Action calls sentiment API → Upsert review with `sentiment` set. |

---

## 7. Next.js data fetching (TanStack Query)

- **useBooks(options)**: Fetches books; optional `categorySlug`, `featured`, `search`. Invalidates on filters.
- **useBookDetails(slug)**: Single book by slug with category.
- **useCategories()**: All categories.
- **useReviews(bookId)**: Reviews for a book (with profile).
- **usePostReview** / **useDeleteReview**: Mutations that invalidate `reviews`.
- **useChatSessions()**: Current user’s sessions (with messages).
- **useChatMessages(sessionId)**: Messages for a session.
- **useSendChatMessage(sessionId)**: Append user/assistant message; invalidates messages and sessions.
- **useCreateChatSession()**: Create session (optional bookId); invalidates sessions.

All hooks use the Supabase client from `@/lib/supabase/client` (browser). Server Actions use `createServerSupabaseClient()`.

---

## 8. Supabase Edge Functions

Optional way to run AI without a long-running Next.js server:

- **ai-chat**: Receives `message`, optional `bookId` and `context`. Verifies JWT, calls Groq, returns `{ answer }`.
- **ai-summarize**: Receives `bookId`. Fetches book, calls Gemini, updates `books.summary`, returns `{ summary }`.
- **generate-embeddings**: Receives `bookId`. Chunks book text, calls HuggingFace embedding API, writes to `embeddings`. Use service role so RLS allows insert.

Set secrets in Supabase: `GROQ_API_KEY`, `GEMINI_API_KEY`, `HUGGINGFACE_API_KEY`, and for embeddings `SUPABASE_SERVICE_ROLE_KEY`.

---

## 9. UI components and pages

- **Home**: Hero, CTA to Explore and Chat, featured books (useBooks featured).
- **Explore**: Category filters, text search, grid of books (useBooks with filters).
- **Book detail**: Cover, metadata, “Generate AI summary”, “Ask AI about this book” (→ chat with bookId), reviews list and form (with sentiment on submit).
- **Chat**: Requires auth. Create session (optionally for a book). Send message; if book context, Server Action calls Groq and appends user + assistant messages.
- **Admin**: Requires auth + profile.role === 'admin'. Placeholder stats (books count, categories) and notes for adding books/embeddings via dashboard or API.

---

## 10. MVP roadmap

1. **Phase 1 – Foundation**  
   - Supabase project; run migration; enable Auth and Storage.  
   - Next.js app with layout, auth (login/signup), protected route wrapper.  
   - Books and categories in DB; Explore and Book detail pages with TanStack Query.

2. **Phase 2 – AI**  
   - Gemini summary (button on book detail).  
   - Groq book Q&A (chat with bookId and context).  
   - HuggingFace sentiment on review submit; store in `reviews.sentiment`.

3. **Phase 3 – Search and scale**  
   - Semantic search: HuggingFace embeddings + pgvector; RPC; optional “Semantic search” on Explore.  
   - Edge Functions (optional): deploy ai-chat, ai-summarize, generate-embeddings; call from client or Server Actions if desired.

4. **Phase 4 – Polish**  
   - Admin UI for books/categories (or rely on Supabase Dashboard).  
   - Rate limiting and cost controls for AI.  
   - Localization (e.g. Amharic) and accessibility.

---

## 11. ⭐ Recommended Final Feature Set for SKE

### Core platform

- Digital books  
- Research papers  
- Knowledge categories  

### AI learning

- AI summaries  
- AI explanation  
- Quiz generator  
- Flashcards  
- Study notes  

### AI knowledge

- Semantic search  
- Knowledge graph  
- Research assistant  

### User collaboration

- Highlights  
- Notes  
- Discussions  

### Intelligence

- Recommendations  
- Trend analytics  
- Study plans  

---

## 12. Security best practices

- **API keys**: Only in server env (e.g. `GROQ_API_KEY`, `GEMINI_API_KEY`, `HUGGINGFACE_API_KEY`). Never in client or repo. Use `.env.local` and reference in `.gitignore`; provide `.env.example` with placeholders.
- **Supabase**: Use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client; RLS enforces access. Use service role only on server or in Edge Functions; never expose in frontend.
- **Auth**: Rely on Supabase Auth and middleware to refresh session. Protect routes with `RequireAuth` and role checks for admin.
- **Rate limiting**: Add rate limits on Server Actions (or Edge Functions) that call Groq/Gemini/HuggingFace (e.g. per user/IP) to avoid abuse and control cost.
- **Input**: Validate and sanitize user input; limit lengths for review content and chat messages.
- **CORS**: Edge Functions set appropriate CORS; in production restrict origins to your domain.
