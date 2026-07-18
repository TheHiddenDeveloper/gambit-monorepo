# Backend Architecture & Frontend Integration

## Overview

The backend is a FastAPI application using SQLAlchemy 2.0 with SQLite, providing a chess game analysis API. It uses Stockfish for engine evaluations and python-chess for PGN parsing.

**However, the frontend and backend are currently completely disconnected.** Every frontend feature uses hardcoded mock data, client-side Stockfish WASM, or Genkit/Gemini AI calls. There is no API client, no proxy, and no fetch call targeting any backend endpoint.

---

## Backend Structure

```
packages/backend/
├── app/
│   ├── main.py              — FastAPI app, endpoints, lifecycle
│   ├── database.py           — SQLAlchemy engine + session (SQLite)
│   ├── models.py             — ORM models (Game, Move, Analysis)
│   ├── schemas.py            — Pydantic V2 schemas
│   ├── init_db.py            — standalone script (has broken import)
│   └── services/
│       ├── engine.py         — Stockfish wrapper (global singleton)
│       └── pgn_parser.py     — PGN import pipeline
├── app/stockfish/
│   └── stockfish.exe         — Windows binary (tracked via LFS)
├── test/
│   └── stockfish_check.py    — ad-hoc test (hardcoded Windows path)
└── requirements.txt
```

### Database Schema

```
Game (1) ——— (*) Move (1) ——— (*) Analysis
```

- **`Game`**: stores PGN metadata (players, result, opening, timestamps) + raw PGN text
- **`Move`**: per-half-move row with SAN, UCI, FEN before/after, evaluation placeholder
- **`Analysis`**: structured engine analysis (centipawn, mate, depth, nodes, mistake type) — **currently unused by any endpoint**

### API Endpoints

| Method | Path | Input | Description |
|---|---|---|---|
| `POST` | `/import_pgn/` | `{ "pgn": "..." }` | Parse PGN, persist game + moves |
| `GET` | `/games/` | `?skip=0&limit=10` | List games (paginated) |
| `GET` | `/games/{id}` | — | Game with all moves (eager-loaded) |
| `POST` | `/analyze/{id}` | — | Stockfish eval on all unanalyzed moves |

### Stockfish Integration

- Engine initialized at app startup via `FastAPI` lifespan
- Module-level global `_engine: Stockfish | None`
- `evaluate_fen(fen)` returns centipawn score (`int`), +10000/-10000 for mate
- Binary path: `app/stockfish/stockfish.exe` (Windows, 77 MB, tracked via LFS)

---

## How the Frontend Currently Works

The frontend is a Next.js 15 app with **zero** integration with this backend.

### Mock Data vs Real Data

| Page | What It Uses | Should Use |
|---|---|---|
| `/` Dashboard | `mockDashboardData` | `GET /games/` + aggregated stats |
| `/games` Library | `mockGames` (3 hardcoded) | `GET /games/` |
| `/games/[id]` Detail | `mockGames.find()` | `GET /games/{id}` |
| `/analysis` Weakness AI | `mockGames` + Gemini API | `POST /analyze/{id}` + Gemini |
| `/analysis-board` | Client-side Stockfish WASM | `POST /analyze/{id}` |
| `/openings` | `mockOpeningPerformance` | `GET /games/` + computed stats |
| `/progress` | `mockDashboardData` + `mockOpeningPerformance` | `GET /games/` + computed stats |
| `/board-editor` | Pure client (chess.js) | Standalone feature |

### What's Missing to Connect Them

1. **No API client** — no `fetch`/`axios` calls, no service layer, no generated client
2. **No proxy config** — `next.config.ts` has no rewrites pointing to the backend
3. **No backend URL env var** — `.env.example` only has `GEMINI_API_KEY`
4. **No CORS on backend** — FastAPI has no `CORSMiddleware`, so browser requests would be blocked
5. **No Next.js API routes** — no `route.ts` files to proxy or wrap backend calls

---

## Notable Issues / Gotchas

- **No `__init__.py`** anywhere — relies on implicit namespace packages (fragile with some tooling)
- **`init_db.py` has a broken import** — uses `from database import` instead of `from .database import`
- **`Move.evaluation` is `String`** but `evaluate_fen` returns `int` — SQLAlchemy coerces but it's a type mismatch
- **`Analysis` table is dead code** — the model and schema exist but no endpoint writes to it
- **`best_move` on `Move` is never populated** — set to `None` on import, never updated
- **Move number is per half-move** — White's 1st = 1, Black's 1st = 2, White's 2nd = 3, etc.
- **Stockfish binary is Windows-only** — system Stockfish or a Linux binary is needed for non-Windows deployment
- **Unused dependencies**: `alembic`, `httpx`, `requests` are in requirements but unused
- **No pagination metadata** — `GET /games/` returns a flat list with no total count
- **No authentication** — fully open API
