# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Working Style

- **Explain like I'm learning**: Beginner-friendly explanations for every change. Explain "why" before "how." Don't assume prior knowledge.
- **Plan first, then implement**: Before touching any files, show a plan of what will change and why. Wait for approval before implementing.
- **One concept at a time**: Break complex changes into digestible pieces.

## Rules — Do NOT Do These

- Do NOT refactor or modify files that weren't explicitly asked about
- Do NOT install new packages without asking first and explaining why
- Do NOT change existing CSS or styling without explicit permission
- Do NOT make changes without showing a plan first
- Do NOT assume something is broken without reading the actual code first

## Commands

### Backend

```bash
npm run dev          # Start backend with nodemon (port 3000)
npm run server       # Start backend without auto-reload
npm run cli          # Run the CLI chat interface
```

### Frontend

```bash
cd frontend && npm start       # Start React dev server (port 3001)
cd frontend && npm run build   # Build for production
cd frontend && npm test        # Run React tests
```

### Tests

```bash
node backend/tests/test-news.js
node backend/tests/test-ai.js
node backend/tests/test-claude-service.js
node backend/tests/test-embeddings.js
node backend/tests/test-chroma.js
```

## Environment Setup

Copy `.env.example` to `backend/.env` and fill in:

- `ANTHROPIC_API_KEY` — Claude API (required for AI features)
- `NEWS_API_KEY` — NewsAPI.org
- `WEATHER_API_KEY` — OpenWeatherMap
- `BRAVE_API_KEY` — Brave Search API
- `OPENAI_API_KEY` — OpenAI (optional, not actively used)

ChromaDB must be running on `localhost:8000` for semantic search. If unavailable, document search falls back to keyword matching.

## Architecture

Split backend/frontend project.

### Backend (Node.js/Express, port 3000)

- `backend/server.js` — Express entry point. Mounts API routes, holds in-memory conversation sessions (keyed by `sessionID`)
- `backend/services/claudeService.js` — Core AI logic. Tool-use loop (max 5 iterations) calling Claude (`claude-sonnet-4-20250514`). Available tools: `searchNews`, `calculate`, `getWeather`, `searchWikipedia`, `searchWeb`, `scrapeWebpage`, `readDocument`, `searchDocument`, `listDocuments`
- `backend/services/documentService.js` — Singleton. PDF/TXT ingestion: download → extract text → chunk (1000 chars, 200 overlap) → store JSON to `backend/storage/` → index in ChromaDB
- `backend/services/chromaService.js` — ChromaDB client wrapper. Local 384-dim embeddings via `embeddingServiceLocal.js` (`@xenova/transformers`, all-MiniLM-L6-v2)

### API Routes

- `POST /api/chat` — Multi-turn chat with Claude tool-use loop (NOT connected to frontend yet)
- `POST /api/news/search` — News search via NewsAPI (`/v2/everything`, scoped to titles)
- `GET /api/news/trending` — Top headlines via NewsAPI (`/v2/top-headlines`)
- `POST /api/documents/upload` — File upload via multer
- `GET /api/documents` — List all uploaded documents
- `POST /api/search` — Semantic search across ingested documents
- `GET /api/health`, `GET /api/stats` — System status

### Frontend (React/CRA, port 3001)

- `frontend/src/App.js` — Router: `/` → HomePage, `/news` → NewsPage, `/library` → LibraryPage, `/settings` → stub
- `frontend/src/services/api.js` — Axios client pointed at `http://localhost:3000/api`
- `frontend/src/components/layout/MainLayout.jsx` — Flex layout with fixed Sidebar + main content area
- `frontend/src/components/layout/Sidebar.jsx` — Navigation: Home, Trending, Your Library, Settings
- `frontend/src/components/common/SearchBar.jsx` — Shared search bar component used on Home and News pages

### Data Flows

**News search**: User types in SearchBar → navigates to `/news?q=query` → NewsPage reads query param → calls `POST /api/news/search` → NewsAPI → articles displayed in cards.

**Smart search (keyword extraction)**: User types natural language → backend sends input to Claude for keyword extraction → extracted keywords sent to NewsAPI → results displayed. Skips Claude if input already looks like plain keywords.

**Trending**: NewsPage loads with no query → calls `GET /api/news/trending` → top headlines displayed.

**Document upload**: LibraryPage drag-and-drop or file picker → `POST /api/documents/upload` → backend processes file → chunks stored to disk + indexed in ChromaDB → document list refreshed.

**Chat (backend only)**: `POST /api/chat` → `claudeService.askClaude()` → Claude API tool-use loop → service calls → final text response. No frontend UI for this yet.

## Code Style & Conventions

- **Service pattern**: Class-based singletons exported as instances (`module.exports = new DocumentService()`). Follow this for new services.
- **Error handling**: Graceful degradation with fallbacks. Never let a missing optional service crash the app.
- **API responses**: Consistent `{ success: true/false, data/error }` shape from all endpoints.
- **Comments**: Explain _why_, not just _what_. This is a portfolio project — code should demonstrate understanding.
- **Backend imports**: `require()` (CommonJS)
- **Frontend imports**: ES module `import` syntax
- **Frontend styling**: Inline React styles (`style={{ }}` objects). NOT Tailwind utility classes. Keep consistent with existing components.

## Design System (Frontend)

- **Theme**: Spotify-inspired dark — primary red `#ef4444`, backgrounds `#121212` / `#1a1a1a` / `#242424`, borders `#282828`, text `#ffffff` / `#b3b3b3`, muted `#6b7280`. No bright or pastel colors.
- **Layout**: `MainLayout` with fixed 240px Sidebar on left. Content areas use CSS grid.
- **Icons**: `lucide-react` only. Match existing icon usage.
- **Article cards**: Text-forward compact design. NO images or image placeholders. Structure: source (red, uppercase) + date → bold title → description → action buttons (Read Article + AI Sparkles).
- **Article list view**: Single row per article — source | title | date | actions. Dense and scannable.
- **Grid/list toggle**: News page supports toggling between card grid and list view.
- **Slide-out panel**: Reusable right-side panel pattern used for Document Q&A and Article Summary. Panel has: header with title + close button, content area, and input/action bar at the bottom. Same dark theme styling as the rest of the app.

## Current Project Status

### Completed:

- Home page with search bar and suggestion chips (navigates to `/news?q=...`)
- Smart search with Claude-powered keyword extraction for natural language queries
- News page with search, trending auto-load, text-forward article cards, and grid/list toggle
- Document Library with drag-and-drop upload, processing, and document cards
- ChromaDB semantic search with keyword fallback
- Backend chat with full Claude tool-use loop (CLI only, no frontend UI)
- Sidebar navigation

### Next to build (in priority order):

1. **Document Q&A (RAG)**: Add a slide-out panel to the Library page. When user clicks a document card, the panel opens on the right with a chat interface scoped to that document. User asks a question → backend generates embedding of the question → searches ChromaDB for relevant chunks from that specific document → sends chunks + question to Claude → Claude responds grounded in the document content. Responses should include source references (which chunks were used). Support follow-up questions (multi-turn within the panel).

2. **Article Summary (Sparkles button)**: Wire up the AI/Sparkles button on article cards. When clicked, a slide-out panel opens on the right showing a structured AI summary of the article. Backend: receive article URL → scrape content with Cheerio → send to Claude with summarization prompt → return structured summary (overview, key points, why it matters). Panel also has a "Read full article" link and an "Ask about this" button for follow-up questions.

### Not a priority right now:

- Delete document functionality (button shows "coming soon" alert)
- Settings page (stub)
- Full chat UI in frontend (backend ready, no frontend)

## Git Conventions

- Commit working code before starting new features
- `.env` files stay out of version control
- `backend/storage/` is gitignored (generated data)
- `node_modules/` is gitignored
- Descriptive commit messages explaining what changed and why

## Key Design Principle

Use Claude (AI) only where reasoning adds genuine value — keyword extraction, summarization, document Q&A, multi-source synthesis. Do NOT route structured API calls through Claude when a direct call is simpler and cheaper.
