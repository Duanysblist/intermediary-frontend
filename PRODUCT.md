# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person: the owner of the account. The app is a personal planner, used alone, against one account with no sign-up. Other audiences are not planned.

## Product Purpose

intermediary helps one person plan what they intend to do, log what actually happened, and review the gap between the two. It covers study and fitness sessions, job applications, certifications, and the documents those depend on. Success means the owner can see the week at a glance, close the loop on plan items, and hand that context to an AI assistant without re-explaining it.

## Positioning

The planner and the assistant share one data model. The assistant reads a Markdown and JSON context block built from the owner's plan, sessions, and reference data. It returns schedule changes as a structured change set. The owner reviews each change as before and after, accepts what they want, and applied batches stay revertible for a week. The frontend never calls a model directly. Changes go through the same plan-item API as manual edits, so the audit log records both. A generic chat cannot offer that loop with the owner's own records, the intention-versus-reality history, and the review step.

## Operating Context

- Weekly rhythm: plan on the status board and calendar week, log sessions against plan items, then run the Review page.
- Reference data (Applications, Certifications, Documents) exists so plan items can point at it. It is not a CRM.
- The Prompt page feeds Claude, either through the backend's `POST /ai/suggest` call or by copy and paste into any assistant. Proposals from the MCP server arrive in the inbox.
- Runs as a static bundle on Vercel against a separate backend API, or in nginx from the Dockerfile.

## Capabilities and Constraints

- Screens: Dashboard, Plan (kanban by status, calendar week, routines, iCalendar feed), Sessions (study and workouts, weekly totals), Applications, Certifications, Documents, Review, Prompt.
- Auth: a JWT in `localStorage`, attached by `src/api/client.ts`. A 401 opens a sign-in prompt over the current page.
- Demo mode (`/demo`): in-memory store with sample data relative to today, no sign-in, no persistence, and a stand-in for Claude so the review flow works.
- Undo history for applied change sets lives in the browser, not on the server.
- Node 20.19+ (CI and Dockerfile use 24). Needs the backend API at `VITE_API_BASE_URL`.
- Terminology: "plan item" is an intention. "Session" is what was logged. "Change set" is the assistant's proposal. "Batch" is an applied change set.

## Brand Commitments

- Name: "intermediary", set as a lowercase wordmark in the header and page title.
- Existing copy, not yet confirmed as binding: the meta description reads "plan what you intend to do, log what actually happened, and hand both to an AI assistant without re-explaining yourself."

## Evidence on Hand

- `README.md`: the product description, screen list, and Claude round-trip steps.
- `src/demo/demoData.ts`: sample data that shows the domain.
- `src/features/prompt/changeSet.ts`: the change-set JSON shape.
- Absent, and not to be fabricated: testimonials, customers, case studies, benchmarks, press, pricing, licensing, or a public launch.

## Product Principles

- Intention and reality stay separate. A plan item is what you meant to do, a session is what happened, and the Review page compares them. Do not merge the two.
- No AI change applies without review. Every suggested change shows before and after, and the owner accepts it.
- One data model, one API. The UI, the assistant, and the MCP server all go through the same backend, so the audit log is the single history.
- Reference data serves plan items. Applications, Certifications, and Documents stay plain records you link to, not a pipeline to manage.
- Reversible by default. Applied batches can be reverted for a week, and manual edits are logged like AI edits.
