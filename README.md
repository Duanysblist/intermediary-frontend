# intermediary-frontend

The human-facing side of [intermediary](https://github.com/Duanysblist/intermediary): a planning
interface where you drag intentions between status columns and calendar days, log what actually
happened, package all of it as context for an AI assistant, and bring the assistant's suggested
schedule changes back in for review. The AI never lives in this app; it reads the same REST API
this UI does.

**Live:** [intermediary-frontend.vercel.app](https://intermediary-frontend.vercel.app) (sign in) ·
[**/demo**](https://intermediary-frontend.vercel.app/demo) (sample data, no sign-in)

## Two ways to run it

| | Demo (`/demo`) | Your account (`/`) |
|---|---|---|
| Data | Sample dataset generated in the browser, relative to today | Your real data from the API |
| Sign-in | None | Username + password configured on the API server |
| Persistence | None; a reload starts over | PostgreSQL behind the API |
| Claude | A built-in stand-in returns a realistic suggestion so the review flow can be tried | Real Claude call through the API when the server has an `ANTHROPIC_API_KEY`; otherwise copy/paste and import |

Both are the same build. The demo is the app mounted under `/demo` with an in-memory store
(`src/demo/`) swapped in for the API client, so every screen and interaction is identical.

## What's here

| Screen | What it does |
|---|---|
| **Dashboard** | Week-at-a-glance: open and overdue intentions, what got done (from the audit log), study and fitness minutes versus what was planned, application pipeline, next exam. |
| **Plan** | Kanban board by status and a calendar week view. Drag a card to a column to change its status (the server appends a `PlanEvent`), onto a day to set its target date, or onto the Unscheduled tray to clear it. Click a card for details, its history, and **Log session** to record the study time or workout that fulfilled it. **Routines** generate recurring items; **Calendar feed** gives a subscribable iCalendar URL. |
| **Sessions** | Log study sessions (optionally against a certification) and workouts. Weekly totals up top. |
| **Applications** | Job application tracker with status filter. |
| **Certifications** | Cards with exam countdown, manual hours, and minutes actually logged in sessions. |
| **Documents** | Register resumes, plans, and guides so plan items can reference them. |
| **Review** | Weekly review: completion rate, planned versus done by intent, study minutes per certification, what slipped, and which intentions get deferred most. |
| **Prompt** | Builds a Markdown + JSON context block (with a computed week summary) from the slices you pick, then: **Ask Claude** (server-side call, returns structured changes), **Open in Claude** (prefills claude.ai), **Copy**, and **Import changes** (paste the JSON any assistant returns). Proposals from the MCP server appear in an inbox here. Every suggestion is shown as before → after, applied only when you accept it, and applied batches can be reverted for a week. |

## How to use it

1. **Set up the reference data once.** Add the certifications you're studying for, the
   applications you have open, and any documents you maintain. Plan items can point at these.
2. **Plan on the board.** Create plan items with an intent (study, exercise, apply, read, write)
   and a target date. Drag between columns as work starts and finishes; switch to the Week view
   and drag cards onto days to schedule them.
3. **Log reality as it happens.** Under Sessions, log study time (against a certification) and
   workouts. The Dashboard compares this with what you planned for the week.
4. **Ask for help without re-explaining.** On the Prompt page pick what to include and either
   press Ask Claude, or Open in Claude / Copy and paste into any assistant. Ask it what to
   change; it answers with a JSON change set.
5. **Import and review.** Press Import changes, paste the JSON, tick what you accept, Apply.
   Every accepted change goes through the same API as a manual edit, so the history stays honest.

### The Claude round-trip

1. The Prompt page renders your data plus a "How to answer" section that asks for changes in a fixed
   JSON shape (`src/features/prompt/changeSet.ts`).
2. Either the server calls Claude (`POST /ai/suggest`, structured output constrained to that shape),
   or you paste the assistant's JSON into **Import changes**.
3. The review dialog lists each proposed update or new item with the current value struck through.
   Tick what you want, click Apply, and the changes go through the normal plan-item API, so the
   audit log records them like any other edit.

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query, React Router 7, dnd-kit.

`src/` is organised by feature. Every backend entity has the same CRUD shape, so
`src/api/resources.ts` builds a typed client per resource (or its demo stand-in) and
`src/hooks/resources.ts` derives the query/mutation hooks. Types in `src/types/index.ts` mirror
the backend DTOs exactly. Auth is a JWT in `localStorage`, attached by `src/api/client.ts`; a 401
anywhere returns you to the sign-in screen.

## Running locally

Requires Node 20+ and the backend running on `http://localhost:8080` (see the backend README).

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Sign in with the backend's `APP_USERNAME` / `APP_PASSWORD` (the
IntelliJ run configurations and `docker compose` use `dev` / `dev`), or open
<http://localhost:5173/demo>. The dev server defaults to the local backend; set
`VITE_API_BASE_URL` in `.env.local` to point elsewhere (see `.env.example`).

| Command | What it does |
|---|---|
| `npm run check` | Lint, type-check, and production build. Run before pushing. |
| `npm run lint` / `npm run typecheck` / `npm run build` | The individual steps. |
| `npm run preview` | Serve the production bundle locally. |

IntelliJ run configurations for `dev` and `check` are in `.run/`. A `Dockerfile` (nginx, SPA
fallback) is included; the backend's `docker compose --profile web up --build` runs the whole stack.

## Deploying

The app is a static bundle. `vercel.json` rewrites every path to `index.html` for client-side
routing, which is also what makes `/demo/...` work. In the Vercel project set
`VITE_API_BASE_URL` to the API origin (the Render URL, no trailing slash); the API's
`APP_CORS_ORIGINS` must include the frontend origin.

## Known limits

- Undo history for imported change sets lives in the browser, not the server.
- Single user. The API has one account; there is no sign-up.
