# intermediary-frontend

The human-facing side of [intermediary](https://github.com/Duanysblist/intermediary): a planning
interface where you drag intentions between status columns and calendar days, log what actually
happened, and package all of it as context for an AI assistant. The AI never lives in this app;
it reads the same REST API this UI does.

## What's here

| Screen | What it does |
|---|---|
| **Dashboard** | Week-at-a-glance: open and overdue intentions, what got done (from the audit log), study and fitness minutes versus what was planned, application pipeline, next exam. |
| **Plan** | Kanban board by status and a calendar week view. Drag a card to a column to change its status (the server appends a `PlanEvent`), or onto a day to set its target date. Click a card for details and its full status history. |
| **Sessions** | Log study sessions (optionally against a certification) and workouts. Weekly totals up top. |
| **Applications** | Job application tracker with status filter. |
| **Certifications** | Cards with exam countdown, manual hours, and minutes actually logged in sessions. |
| **Documents** | Register resumes, plans, and guides so plan items can reference them. |
| **Prompt** | Select which slices of data to include and copy a Markdown + JSON context block into any AI assistant, complete with instructions for how an agent can call the API itself. |

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query, React Router 7, dnd-kit.

`src/` is organised by feature. Every backend entity has the same CRUD shape, so
`src/api/resources.ts` builds a typed client per resource and `src/hooks/resources.ts` derives
the query/mutation hooks from it. Types in `src/types/index.ts` mirror the backend DTOs exactly.

## Running locally

Requires Node 20+ and the backend running on `http://localhost:8080` (see the backend README:
`docker compose up`, or run it from IntelliJ).

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. The dev server defaults to the local backend; set
`VITE_API_BASE_URL` in `.env.local` to point elsewhere (see `.env.example`). The backend's CORS
config already allows the Vite origin.

Other scripts:

| Command | What it does |
|---|---|
| `npm run check` | Lint, type-check, and production build. Run before pushing. |
| `npm run lint` | ESLint only. |
| `npm run typecheck` | `tsc` only. |
| `npm run build` | Production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally. |

IntelliJ run configurations for `dev` and `check` are in `.run/` and appear in the run dropdown.

## Deploying

The app is a static bundle. `vercel.json` rewrites every path to `index.html` for client-side
routing. Set `VITE_API_BASE_URL` to the deployed API (for example the Render URL) in the Vercel
project's environment variables; the backend's CORS list must include the frontend origin.

## Known limits

- The API's `PUT` merges non-null fields, so a target date can be moved but not cleared once set.
  The week view's "Unscheduled" tray is therefore a drag source only.
- No authentication yet. Both the API and this UI assume a single trusted user.
