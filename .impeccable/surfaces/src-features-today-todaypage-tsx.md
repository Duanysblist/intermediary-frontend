---
version: 1
slug: "src-features-today-todaypage-tsx"
primary_target: "src/features/today/TodayPage.tsx"
related_targets: ["src/components/layout/AppShell.tsx"]
---

# Surface brief: the app shell and Today (phone first)

Scope: every screen of the app, led by the Today screen at `/`. Mode: Operate. Used mostly on a phone, one-handed, through the day; desktop still works.

Audience and job: the account owner ticks off today's plan items and logs study or workout sessions. Late items must be impossible to miss. Must stay: every existing screen, flow and API call; demo mode; the drag board on desktop.

Chosen direction: the category standard, at Todoist's level of polish (the user picked the standard look and named Todoist as the benchmark).

## Direction contract

THESIS: A clean modern task app, played straight at Todoist's finish: grouped lists, round checkboxes, one indigo accent. It refuses the old hairline-and-underlined-tabs look that read like GitHub.

OWN-WORLD: Grouped grey page (#F2F2F7 by day, near-black at night) holding white 12px-rounded list groups; system UI type with large bold page titles; indigo #5856D6 as the only accent; 24px round checkboxes ringed in the item's kind colour; translucent bottom tab bar; a pill-shaped floating action button.

STORY: Open the app on the phone, see what is late and what is today, tick items with a thumb, log a session from the floating button. Everything else is one tab away.

FIRST VIEWPORT: Large title "Today", then the date and counts. A "Running late" group with a red label above the "Today" group. Rows at least 56px tall: round checkbox on the left, title and one meta line, kind chip on the right. A "Log session" pill button floats bottom right above a five-item tab bar (Today, Plan, Sessions, Jobs, More).

FORM: The category standard (canon), benchmark Todoist. seed:4e7903d237d6171b. Signature interaction: completing a task fills the circle with its kind colour, draws the check and strikes the title through; reduced motion swaps state instantly.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
