# Gambit — Chess Insight

**Repository**: `TheHiddenDeveloper/gambit-monorepo`

Monorepo with two packages: a Next.js frontend and a FastAPI backend.

> **IMPORTANT**: Both services live under `packages/`. The root is **not** a Node.js workspace — run commands from each package dir or use `--prefix`.

## Frontend (`packages/frontend/`)

- **Stack**: Next.js 15 (App Router, Turbopack), React 18, shadcn/ui, Tailwind CSS v3, recharts, Genkit, chess.js, react-chessboard
- **Port**: 9002 (`cd packages/frontend && npm run dev`)
- **Run from root**: `npm --prefix packages/frontend run dev` (recommended)
- **Commands**:
  - `npm run dev` — dev server with Turbopack on port 9002
  - `npm run genkit:dev` — Genkit flow dev server with Gemini API
  - `npm run genkit:watch` — same with file watching
  - `npm run build` / `npm run lint` / `npm run typecheck` (`tsc --noEmit`)
- **TypeScript path alias**: `@/*` → `./src/*`
- **Next.js config quirks**:
  - `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` are both `true` — lint/typecheck must be run explicitly
- **shadcn/ui**: configured with `components.json`, components in `src/components/ui/`, uses `lucide-react` icons
- **AI flows**: Genkit flows live in `src/ai/flows/`, default model is `googleai/gemini-2.0-flash`
- **Env**: requires `GEMINI_API_KEY` in `.env.local` (see `.env.example`)
- **Desktop**: optional Tauri wrapper (`src-tauri/`) — build outputs to `out/`, dev URL points to `http://localhost:9002`
- **No test framework installed** (no jest/vitest in devDependencies)

## Backend (`packages/backend/`)

- **Stack**: FastAPI, SQLAlchemy 2.0, SQLite, Stockfish (python-chess, stockfish Python package), Pydantic V2, uvicorn
- **DB**: SQLite at `chess.db` (auto-created; gitignored)
- **Stockfish binary**: `app/stockfish/stockfish.exe` (committed)
- **Endpoints**:
  - `POST /import_pgn/` — import PGN and persist game + moves
  - `GET /games/` — list games (paginated)
  - `GET /games/{id}` — game with moves
  - `POST /analyze/{id}` — run Stockfish eval on all unanalyzed moves
- **Lifecycle**: Stockfish engine is initialized at startup via FastAPI lifespan; tables auto-created on import
- **To run**: `cd packages/backend && uvicorn app.main:app` (or `--reload`)

## Tests

- No test framework in either package.
- Backend has one ad-hoc script: `packages/backend/test/stockfish_check.py` (hardcoded Windows path — not portable).

## Navigation / Pages

| Route | Description |
|---|---|
| `/` | Dashboard (mock data) |
| `/games` | Game library |
| `/games/[id]` | Game detail + analysis board |
| `/analysis` | AI weakness detection (Genkit + Gemini) |
| `/analysis-board` | Analysis board |
| `/openings` | Opening explorer |
| `/board-editor` | Board editor |
| `/progress` | Progress tracking |
| `/settings` | App settings |
