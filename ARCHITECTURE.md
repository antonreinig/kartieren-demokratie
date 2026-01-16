# Kartieren Demokratie - Architecture Documentation

This document provides a comprehensive overview of the codebase structure and architecture for the Kartieren Demokratie project.

## Project Overview

A **deliberative democracy platform** where users can engage in AI-moderated interviews about civic topics. The platform provides a media library ("Mediathek") with videos, PDFs, and links for context, and an AI chat that guides users through deliberative reflection.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript (Strict Mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Vercel Postgres + Prisma ORM |
| Auth | Auth.js (NextAuth v5) with Magic Link |
| AI | Vercel AI SDK v6 + OpenAI GPT-4o |
| File Uploads | UploadThing |
| Background Jobs | Inngest |

---

## Directory Structure

```
src/
├── actions/           # Server Actions (data mutations)
│   ├── artifact.ts    # Artifact CRUD operations
│   ├── get-topic.ts   # Topic fetching helpers
│   ├── guest.ts       # Guest token management
│   └── topic.ts       # Topic CRUD operations
│
├── app/               # Next.js App Router pages
│   ├── [slug]/        # Dynamic topic pages
│   │   ├── page.tsx   # Main topic view (chat + mediathek)
│   │   ├── contribute/# User contribution flow
│   │   └── results/   # Topic results/summary
│   ├── api/           # API routes
│   │   ├── auth/      # NextAuth handlers
│   │   ├── chat/      # AI chat endpoint + history
│   │   ├── transcribe/# Whisper audio transcription
│   │   └── uploadthing/# File upload handlers
│   ├── create/        # Topic creation wizard
│   └── dashboard/     # Admin dashboard
│
├── components/        # React components
│   ├── chat/          # Chat-specific components
│   │   └── topic-chat-interface.tsx  # Main chat UI
│   ├── layout/        # Layout components
│   │   ├── mediathek-view.tsx        # Media library grid
│   │   ├── topic-app-shell.tsx       # Main app shell
│   │   ├── topic-page-client.tsx     # Topic page wrapper
│   │   ├── sidebar.tsx               # Navigation sidebar
│   │   └── slug-selection-client.tsx # Topic selection/creation
│   ├── ui/            # shadcn/ui primitives
│   ├── AudioVisualizer.tsx           # Mic recording visualizer
│   ├── ContributeForm.tsx            # User contribution form
│   └── TopicWizard.tsx               # Multi-step topic creator
│
├── lib/               # Shared utilities
│   ├── prisma.ts      # Prisma client singleton
│   ├── utils.ts       # General utilities (cn helper)
│   ├── rate-limit.ts  # Upstash rate limiting
│   ├── logger.ts      # Logging utility
│   └── avatar-gradient.ts # User avatar gradients
│
├── inngest/           # Background job definitions
│   ├── client.ts      # Inngest client setup
│   └── functions.ts   # Job function definitions
│
├── auth.ts            # Auth.js configuration
├── auth.config.ts     # Auth providers config
└── middleware.ts      # Next.js middleware
```

---

## Key Components

### 1. Topic Page Flow (`/[slug]`)

```
[slug]/page.tsx (Server Component)
    ↓
TopicPageClient (Client Component)
    ↓ manages guestToken, loads chat history
TopicAppShell
    ├── TopicChatInterface (Chat view)
    └── MediathekView (Media library view)
```

### 2. Chat System

| Component | Purpose |
|-----------|---------|
| `TopicChatInterface` | Chat UI with messages, input, audio recording |
| `/api/chat/route.ts` | AI streaming endpoint with tools |
| `/api/chat/history/route.ts` | Chat history persistence |

**AI Tools:**
- `suggestContent`: Suggests relevant artifacts from the media library

### 3. Media Library

| Component | Purpose |
|-----------|---------|
| `MediathekView` | Displays artifacts in categorized grid |
| `VideoCard` | YouTube video card with thumbnail |
| `CompactCard` | PDF/Link card with icon |

---

## Data Models (Prisma)

```
Topic
 ├── id, slug, title, description, scope
 ├── centralQuestion, context, endsAt
 ├── creatorId (User)
 ├── artifacts[] (Artifact)
 └── chatSessions[] (ChatSession)

Artifact
 ├── id, title, url, description, type
 ├── topicId (Topic)
 ├── tags[] (Tag)
 └── takeaways[] (Takeaway)

ChatSession
 ├── id, topicId, userId?, guestToken?
 └── messages[] (ChatMessage)

ChatMessage
 ├── id, sessionId, role, content
 └── createdAt
```

---

## Authentication Flow

1. **Anonymous Users**: Auto-generated `guestToken` stored in `localStorage`
2. **Authenticated Users**: Magic Link email authentication via Auth.js
3. **Session Persistence**: Chat history linked to either `userId` or `guestToken`

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | AI chat streaming with tool support |
| `/api/chat/history` | GET | Fetch chat history for session |
| `/api/transcribe` | POST | Whisper audio transcription |
| `/api/uploadthing` | POST | File upload handling |

---

## Styling Conventions

| Element | Color |
|---------|-------|
| Primary Accent | `#F8CD32` (Yellow) |
| Background | `#EAEAEA` (Light Gray) |
| Dark Text/Bubbles | `#303030` |
| Font (Accent) | "Gochi Hand" (handwritten) |

---

## Known Patterns

### Guest Token Management
The `guestToken` pattern for anonymous users:
```typescript
let token = localStorage.getItem("guestToken");
if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("guestToken", token);
}
```
> ⚠️ **DUPLICATION ALERT**: This pattern exists in multiple files. Consider extracting to `lib/guest-token.ts`.

### AI SDK v6 Message Structure
Messages use the `parts` array for content:
```typescript
// Extracting text from parts
const text = message.parts
    ?.filter(p => p.type === 'text')
    .map(p => p.text)
    .join('');

// Tool results are in parts with type 'tool-invocation'
message.parts?.filter(p => p.type === 'tool-invocation')
```

---

## Code Quality Notes

### ✅ Well-Organized
- Clear separation between layout, chat, and UI components
- Server Actions in dedicated `actions/` directory
- Shared utilities in `lib/`

### ⚠️ Areas for Improvement

1. **Guest Token Logic** - Duplicated in 3 files, should be extracted to a hook or utility
2. **Type Definitions** - Some `any` types remain, should be properly typed
3. **Error Handling** - Could be more consistent across API routes

---

## Development Workflow

```bash
# Start development server
npm run dev

# Database operations
npx prisma studio    # Open Prisma GUI
npx prisma db push   # Push schema changes
npx prisma generate  # Regenerate client

# Build for production
npm run build
```

---

*Last updated: 2026-01-16*
