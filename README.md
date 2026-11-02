# intermediary-frontend

The web UI for [intermediary](https://github.com/Duanysblist/intermediary). You plan intentions on a
status board and a calendar week, log what actually happened, and package both as context for an AI
assistant. The assistant's suggested schedule changes come back as a change set you review before
anything is applied. The AI never runs inside this app; it reads the same REST API the UI does.

Live: [intermediary-frontend.vercel.app](https://intermediary-frontend.vercel.app) (sign in), or
[/demo](https://intermediary-frontend.vercel.app/demo) for sample data with no sign-in.

## Screens

| Screen | What it does |
|---|---|
| Dashboard | The week at a glance: open and overdue items, what got done, planned versus logged minutes, application pipeline, next exam. |
| Plan | Kanban by status and a calendar week. Drag a card to a column to change status, onto a day to set its date, or onto Unscheduled to clear it. A card's detail view shows its history and **Log session**. Routines generate recurring items, and the calendar feed gives an iCalendar URL. |
| Sessions | Study sessions (optionally against a certification) and workouts, with weekly totals. |
| Applications, Certifications, Documents | Reference data that plan items can point at. |
| Review | Weekly review: completion rate, planned versus done by intent, study minutes per certification, what slipped, what keeps getting deferred. |
| Prompt | Builds a Markdown and JSON context block from the slices you pick. See below. |

### The Claude round trip

1. The Prompt page renders your data plus a "How to answer" section that asks for changes in the
   JSON shape defined in `src/features/prompt/changeSet.ts`.
2. Get a change set one of three ways: **Ask Claude** (the server calls Claude through
   `POST /ai/suggest`, and the answer is also saved to the inbox so switching apps mid-request loses
   nothing), **Open in Claude** or **Copy** and paste into any assistant, then **Import changes**
   with the JSON it returns. Proposals posted by the MCP server show up in the inbox.
3. The review dialog shows each change as before and after. Tick what you accept and apply. Changes
   go through the normal plan-item API, so the audit log records them like manual edits. Applied
   batches can be reverted for a week.

## Demo mode

`/demo` is the same build with an in-memory store (`src/demo/`) in place of the API client. It has
sample data relative to today, no sign-in, no persistence, and a built-in stand-in for Claude so the
review flow works.

## Code layout

React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query, React Router 7, dnd-kit.

- `src/features/` has one folder per screen.
- `src/api/resources.ts` builds a typed client per backend resource, and `src/hooks/resources.ts`
  derives the query hooks from it.
- `src/types/index.ts` mirrors the backend DTOs.
- Auth is a JWT in `localStorage`, attached in `src/api/client.ts`. A 401 opens a sign-in prompt
  over the current page.

## Run, test, build

Needs Node 20.19+ (CI and the Dockerfile use 24) and the backend on `http://localhost:8080`.

```bash
npm ci
npm run dev        # http://localhost:5173
```

Sign in with the backend's `APP_USERNAME` / `APP_PASSWORD` (`dev` / `dev` under the IntelliJ run
configurations in `.run/` and the backend's `docker compose`), or open `/demo`. Set
`VITE_API_BASE_URL` in `.env.local` to use a different API (see `.env.example`).

| Command | Does |
|---|---|
| `npm run check` | Lint, test, build. This is what CI runs. |
| `npm run lint`, `npm test`, `npm run typecheck`, `npm run build` | The individual steps. `build` also type-checks. |
| `npm run preview` | Serve the production bundle. |

## Deploy

The output is a static bundle. `vercel.json` rewrites every path to `index.html`, which makes client
routes and `/demo/...` work. Set `VITE_API_BASE_URL` in the Vercel project to the API origin with no
trailing slash, and add the frontend origin to the API's `APP_CORS_ORIGINS`. The `Dockerfile` serves
the bundle with nginx; the backend's `docker compose --profile web up --build` runs the whole stack.

## Limits

- Undo history for applied change sets is stored in the browser, not on the server.
- Single user: the API has one account and no sign-up.
