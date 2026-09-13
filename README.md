# GreenVision

AI-powered community park & tree health monitor. FastAPI + LangGraph + Gemini
2.5 Flash backend, React + Vite frontend.

```
greenvision/
  backend/    FastAPI app (see backend/README below)
  frontend/   React + Vite app
```

## 1. Supabase setup (one-time)

1. Create a project at https://supabase.com.
2. **Database**: Project Settings → Database → Connection string → URI.
   Copy it and rewrite the scheme to `postgresql+asyncpg://...` for
   `DATABASE_URL` in `backend/.env`.
3. **Storage**: Storage → Create a new bucket named `tree-photos` (private is
   fine — the backend generates signed URLs). Match the name to
   `SUPABASE_STORAGE_BUCKET` in `backend/.env` if you name it differently.
4. **Service key**: Project Settings → API → `service_role` secret key →
   `SUPABASE_SERVICE_KEY` in `backend/.env`. **Never expose this key to the
   frontend** — it bypasses row-level security.
5. **Gemini API key**: https://aistudio.google.com/apikey → `GEMINI_API_KEY`
   in `backend/.env`.

## 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then fill in real values

# Apply migrations manually (required — this is NOT run automatically
# on startup). Re-run this any time you pull a new migration.
python scripts/migrate.py

python main.py
```

**Which Supabase connection string to use for `DATABASE_URL`:** use the
**Session pooler** (port `5432`), not the Transaction pooler (port `6543`).
The transaction pooler multiplexes connections mid-transaction and can hang
indefinitely on schema migrations. Session pooler is still IPv4 (works from
networks that can't reach Supabase's IPv6-only direct connection) but
behaves like a normal persistent connection.

If you change a model, generate a new migration, then apply it the same way:

```bash
alembic revision --autogenerate -m "describe the change"
python scripts/migrate.py
```

API docs: http://localhost:8000/docs
Health check: http://localhost:8000/health

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env    # point VITE_API_BASE_URL at your backend
npm run dev
```

App runs at http://localhost:5173. Register an account, then go to **Parks**
to add a park and at least one tree before using **Scan a Tree**.

## Notes

- `ALLOWED_ORIGINS` in `backend/.env` must explicitly list every frontend
  origin that will call the API (no wildcards) — add your deployed frontend
  URL there before going live.
- The AI pipeline calls Gemini 2.5 Flash for each of its 3 steps
  (observe → diagnose → recommend). On a 429 (quota) or 503 (overloaded)
  response, it immediately retries that same step against
  `gemini-2.5-flash-lite` before surfacing an error.
- `AIAnalysis` records are immutable model output; `Report` is the
  actionable record staff work from, optionally linked to one.
