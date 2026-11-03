---
name: intermediary
description: A phone-first personal planner in the standard task-app style: a grouped list, one indigo accent, and light and dark modes that follow the system setting.
colors:
  page: "#f2f2f7"
  surface: "#ffffff"
  sunken: "#e9e9ee"
  ink: "#1c1c1e"
  ink-2: "#3a3a3c"
  muted: "#5c5c61"
  faint: "#636368"
  rule: "#e5e5ea"
  rule-strong: "#d1d1d6"
  accent: "#5856d6"
  accent-strong: "#4644c4"
  accent-tint: "#eeeefc"
  on-accent: "#ffffff"
  focus: "#5856d6"
  danger: "#d70015"
  danger-strong: "#b80012"
  danger-tint: "#fdecee"
  ok: "#1e7b34"
  ok-tint: "#e7f5eb"
  warn: "#a05a00"
  warn-tint: "#fff4e0"
  scrim: "rgb(0 0 0 / 0.35)"
  tone-blue-soft: "oklch(93.2% 0.032 255.585)"
  tone-blue: "oklch(48.8% 0.243 264.376)"
  tone-amber-soft: "oklch(96.2% 0.059 95.617)"
  tone-amber: "oklch(48% 0.14 48.998)"
  tone-violet-soft: "oklch(94.3% 0.029 294.588)"
  tone-violet: "oklch(49.1% 0.27 292.581)"
  tone-green-soft: "oklch(96.2% 0.044 156.743)"
  tone-green: "oklch(48% 0.14 150.069)"
  tone-red-soft: "oklch(93.6% 0.032 17.717)"
  tone-red: "oklch(50.5% 0.213 27.518)"
  tone-gray-soft: "oklch(96.7% 0.003 264.542)"
  tone-gray: "oklch(44.6% 0.03 256.802)"
  tone-slate-soft: "oklch(96.8% 0.007 247.896)"
  tone-slate: "oklch(48% 0.046 257.417)"
  tone-teal-soft: "oklch(95.3% 0.051 180.801)"
  tone-teal: "oklch(51.1% 0.096 186.391)"
  tone-orange-soft: "oklch(95.4% 0.038 75.164)"
  tone-orange: "oklch(48% 0.17 38.402)"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.375
  body-sm:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.25
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1
  button:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
  stat:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
rounded:
  control: "10px"
  item: "8px"
  card: "12px"
  sheet: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 1rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 1rem"
  button-secondary-hover:
    backgroundColor: "{colors.sunken}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 1rem"
  button-ghost:
    textColor: "{colors.ink-2}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.625rem 0.75rem"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"
  pill:
    rounded: "{rounded.full}"
    typography: "{typography.label}"
    padding: "0.125rem 0.625rem"
  fab:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    height: "52px"
    padding: "0 1.25rem 0 1rem"
---

# Design System: intermediary

## Overview

**Creative North Star: "The Standard Task App"**

intermediary is a personal planner built in the category standard: a grouped list on a grey page, round checkboxes, one accent, and a bottom tab bar. It is played straight, at the polish of Todoist and iOS. The product is a single person's working tool, used mostly on a phone, one-handed, through the day. The system favours fast reading and thumb reach over decoration.

The app follows the phone's light or dark setting. Every colour is a semantic token with a light and a dark value; components never name a raw colour. In light mode the page is `#f2f2f7` and cards are white; in dark mode the page is near-black and cards are `#1c1c1e`. Depth comes from the grouped-list contrast between page and card, not from shadow. Shadows appear only on floating elements: the floating action button, the bottom sheet and dialog, and the drag overlay.

Type is the system UI stack at the platform's own scale. The page title is large and bold; everything else steps down in size and grey value. Lists carry the content. The Today screen leads with late items, then today's items, then the week.

The old top tab row with underlined tabs is gone; navigation lives in a bottom tab bar below `lg` and a sidebar from `lg`. Hairline rules remain only as separators between rows inside a group, which is the list pattern itself.

**Key Characteristics:**
- Phone first. Below `lg` the bottom tab bar and floating action button are the navigation; from `lg` a 240px left sidebar replaces them.
- Grouped lists: white 12px-rounded groups on a grey page, with hairline separators between rows.
- One accent, indigo, used for the primary action, the active tab, the floating button, and links.
- Round 24px task checks ringed in each item's kind colour; filled when done.
- Light and dark modes, both first-class, selected by the system setting.
- System UI typography; the page title is the largest object on any screen.

## Colors

The palette is a set of named semantic tokens defined once in `src/index.css` (`@theme`, with the dark values under `@media (prefers-color-scheme: dark)`). Components use the names only. The page declares `color-scheme: light dark`.

### Primary
- **Indigo Accent** (`#5856d6` light, `#8e8cff` dark; token `accent`): the one accent. It fills the primary button and the floating action button, marks the active tab and sidebar item, and colours links and the "Week view" link.
- **Focus** (`#5856d6` light, `#8e8cff` dark; token `focus`): the focus outline and input focus ring.
- **Indigo Strong** (`#4644c4` light, `#a9a7ff` dark; token `accent-strong`): pressed and hovered state of the primary button, and the "today" column label on the week view.
- **Indigo Tint** (`#eeeefc` light, `#25244a` dark; token `accent-tint`): the active sidebar item, the text selection, and the drop-target fill on the week view.
- **On Accent** (`#ffffff` light, `#0e0e10` dark; token `on-accent`): text and icons on an accent fill.

### Neutral
- **Ink** (`#1c1c1e` light, `#f5f5f7` dark; token `ink`): titles and primary text.
- **Ink 2** (`#3a3a3c` light, `#d1d1d6` dark; token `ink-2`): field labels, ghost buttons, and secondary text in a row.
- **Muted** (`#5c5c61` light, `#98989f` dark; token `muted`): metadata lines, subtitles, the page summary, and inactive tab labels.
- **Faint** (`#636368` light, `#85858b` dark; token `faint`): placeholders and "No date" markers.
- **Rule** (`#e5e5ea` light, `#2c2c2e` dark; token `rule`): row separators inside a group and the tab bar's top border.
- **Rule Strong** (`#d1d1d6` light, `#3a3a3c` dark; token `rule-strong`): input and secondary-button borders.
- **Page** (`#f2f2f7` light, `#0e0e10` dark; token `page`): the grey canvas behind every screen.
- **Surface** (`#ffffff` light, `#1c1c1e` dark; token `surface`): list groups, cards, inputs, the tab bar at 95% opacity, sheets and dialogs.
- **Sunken** (`#e9e9ee` light, `#161618` dark; token `sunken`): hover fill on rows and ghost buttons, and the segmented control's track.
- **Scrim** (`rgb(0 0 0 / 0.35)` light, `rgb(0 0 0 / 0.6)` dark; token `scrim`): the backdrop behind a sheet or dialog.

### Status
- **Status Tones**: each status or kind value has one tone everywhere it appears, mapped per value in `src/components/ui/tones.ts`. A tone is a soft fill with an ink of the same hue (`tone-<name>-soft` and `tone-<name>`). Blue is study and in-progress; amber is scheduled, deferred, and read; violet is apply, interviewing, and resume; green is done, offer, passed, and walk; red is rejected and failed; teal is exercise and workout A and guide; orange is write; gray is planned, planning, other, and withdrawn; slate is canceled and ghosted. Dark-mode tones are all lifted to 85% lightness at 30% soft fills.
- **Danger** (`#d70015` light, `#ff6961` dark; token `danger`; `danger-strong` `#b80012` / `#ff8a84` for hover): destructive buttons, overdue dates, the "Running late" label, and error text. `danger-tint` (`#fdecee` / `#3a1c1c`) fills error banners.
- **Ok** (`#1e7b34` light, `#30d158` dark; token `ok`; tint `#e7f5eb` / `#11301b`): a positive stat, such as "Done this week" when non-zero.
- **Warn** (`#a05a00` light, `#ffb340` dark; token `warn`; tint `#fff4e0` / `#33270f`): the demo-mode banner and mid-range scores.

### Named Rules
**The One Accent Rule.** Indigo marks the one thing the user can act on right now. A screen with several accent calls to action has lost its order. Status tones are a separate palette and do not count as accent.

**The Honest Status Rule.** A status or kind carries the same tone on every screen. Never assign a status a second colour because a layout looks better that way.

**The Kind Ring Rule.** A task's round check takes the tone of its kind. It is a ring when open and a solid fill when done.

## Typography

**Display Font:** the system UI stack (`ui-sans-serif, system-ui, sans-serif`), the Tailwind default. `index.css` does not load a web font.
**Body Font:** the same stack.
**Label/Mono Font:** the same stack. No monospace is used on the phone surfaces covered here.

**Character:** plain and native. The page title does the work; the platform's own letterforms carry the rest.

### Hierarchy
- **Display** (700, 2rem / 32px on phone and 1.5rem / 24px from `lg`, line-height 1.25, tracking -0.025em): the page title ("Today", "Plan"). One per screen.
- **Title** (600, 1.125rem / 18px): sheet and dialog headings, such as "More".
- **Section** (600, 0.9375rem / 15px, `ink-2`, sentence case): the heading above a list group ("Running late", "Today", "Coming up"), the week's day names, and table headers. Never uppercase or tracked.
- **Body** (400, 1rem / 16px on phone and 0.875rem / 14px from `lg`, leading snug): task-row titles and form input text. Inputs are 16px on phone so iOS does not zoom on focus.
- **Body small** (400, 0.875rem / 14px, line-height 1.25rem): rows on `lg`, page subtitles, and the "Coming up" row titles.
- **Label** (500, 0.75rem / 12px): metadata lines under a task title, status and kind pills, and column counts.
- **Button** (600, 0.9375rem / 15px on phone and 0.875rem / 14px from `sm`).
- **Stat** (600, 1.25rem / 20px on phone and 1.5rem / 24px from `sm`, tabular numerals): the figure in each tile on the Today "This week" grid.

### Named Rules
**The Tabular Numbers Rule.** Any figure a user compares across tiles or rows uses tabular numerals (`tabular-nums`).

## Layout

Phone first. The content is a single column with `px-4` (16px) gutters below `sm`, `px-6` (24px) from `sm`, and `px-10` (40px) from `lg`. The column is capped at `max-w-5xl` (64rem / 1024px) and centred.

Below `lg` the shell adds: a fixed bottom tab bar, 56px tall (`min-h-14`), with five equal columns (Today, Plan, Sessions, Jobs, More) and the safe-area inset below it; and a floating action button above it. The content's bottom padding is `calc(9rem + env(safe-area-inset-bottom))` so the last row clears both. The top padding is `max(1.25rem, env(safe-area-inset-top))`. The app shell is `min-h-dvh` so a short page still fills the visible viewport.

From `lg` (64rem) the bottom bar and floating button are hidden and a 240px fixed left sidebar (`w-60`) holds the same tabs, with the content offset by `lg:pl-60`. The "Log session" action moves into the page header.

The Today screen splits into two columns from `lg` (a 3:2 grid), with the list on the left and "This week" stats and "Recent changes" on the right. Below `lg` they stack, the list first. The "This week" stat grid is two columns with an 8px gap on phone and a 12px gap from `sm`.

The Plan board's status columns are 85% of the viewport on phone (snapping sideways) and 18rem (`w-72`) from `sm`. The week view is one column on phone, four from `sm`, and seven from `lg`. Applications shows a card list below `md` and a table from `md`.

Spacing follows a 4px base (Tailwind's spacing scale). Section gaps are 24px (`space-y-6`). Within a group, rows have no gap; the title and metadata line sit 2px apart. Section titles sit 8px above their group. Page titles have 20px below them on phone and 24px from `sm`.

## Elevation & Depth

The system is flat at rest. Depth on the Today screen comes from the grey page and white groups, with no shadow on a resting group or row. Shadows are reserved for elements that float above the content: the floating action button, the bottom sheet and centred dialog, and the drag overlay on the Plan board. Known exception, not part of the system: Plan board cards carry `shadow-xs` at rest and `shadow-sm` on hover.

### Shadow Vocabulary
- **Floating action** (`box-shadow: 0 10px 15px -3px rgb(88 86 214 / 0.25), 0 4px 6px -4px rgb(88 86 214 / 0.25)`): the "Log session" button. The shadow is tinted with the accent, not neutral grey.
- **Sheet and dialog** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 1px rgb(28 28 30 / 0.05)`): the bottom sheet on phone and the centred dialog from `sm`. The 1px ring is `ink` at 5%.
- **Drag overlay** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): the card that follows the pointer on the Plan board, tilted 1 degree with an accent border at 50%.

### Named Rules
**The Flat-Groups Rule.** Lists, groups, rows, and cards at rest carry no shadow. A shadow means the element is floating above the page.

**The Tinted Float Rule.** The floating action button's shadow takes the accent colour. Other floating shadows are neutral black.

## Shapes

The form language is rounded and consistent. Controls (buttons, inputs, and the segmented control) use 10px. List groups and cards use 12px. Plan board items use 8px. The bottom sheet's top corners use 16px. Pills and the floating action button are fully round. Dividers are one pixel `rule`. There are no ornaments, decorative shapes, or illustrations.

Task checks are 24px circles with a 2px border. Icons are a single 24px stroke set (`src/components/ui/Icon.tsx`) drawn at 1.8 stroke weight, with 2.4 to 3.2 for small or emphasised glyphs.

## Components

Each component is a native-feeling version of its category pattern. Nothing decorates the component itself.

### Buttons
- **Shape:** 10px radius on every variant (`rounded-[10px]`). Button labels are `font-semibold`.
- **Primary:** Indigo `accent` fill, `on-accent` text, 44px tall on phone (`min-h-11`), 16px horizontal padding. From `sm` the height is 36px with 14px horizontal padding and 8px vertical padding, the pointer size.
- **Hover / Focus:** hover moves to `accent-strong`. Focus is the base 2px `focus` outline offset by 2px, the same as every other control, so it reads on white and on the accent fill alike.
- **Secondary:** `surface` fill, 1px `rule-strong` border, `ink` text. Hover fills `sunken`.
- **Danger:** `danger` fill with literal white text (`#ffffff`) in both modes. Used for destructive actions.
- **Ghost:** no fill, `ink-2` text. Hover fills `sunken` and darkens the text to `ink`.
- **Pressed:** the button dims to 80% opacity on `:active`.
- **Disabled:** 50% opacity, not-allowed cursor.

### Pills
- **Style:** fully round, label type, `px-2.5 py-0.5`. Background is the tone's soft fill and text is its ink.
- **State:** a pill never changes state on its own. Its tone is set by the value it names, through `tones.ts`.

### Task Rows and List Groups
- **Group:** `surface` background, 12px radius, no border or shadow. Rows inside are separated by a 1px `rule` line.
- **Row:** at least 56px tall (`min-h-14`) on the whole row. From left: a 48px-wide tap area holding the round check, then the title and an optional metadata line, then the kind pill on the right.
- **Round check:** 24px circle, 2px border in the kind's tone, transparent centre. When done, it fills with the tone and shows a white check. The check animates only after a tap (see Motion).
- **Title:** body size. A done item is struck through in `muted`. An overdue item keeps the same title style.
- **Metadata:** label size, `muted`, joined by ` · `. An overdue line is `danger`, medium weight, and begins "Due".
- **Running late:** the first group on the Today screen is headed "Running late" in `danger`. Its rows are the same as any other group.

### Cards and Tiles
- **Corner Style:** 12px radius on cards, stat tiles, and list groups.
- **Background:** `surface` on the `page` background, in both modes.
- **Border:** none on Today groups.
- **Internal Padding:** 16px (`p-4`); stat tiles use 12px on phone and 16px from `sm`.

### Inputs / Fields
- **Style:** `surface` fill, 1px `rule-strong` border, 10px radius, `px-3`, 10px vertical padding on phone (8px from `sm`).
- **Text size:** 16px on phone so iOS does not zoom on focus; 14px from `sm`.
- **Placeholder:** `faint`.
- **Focus:** the border moves to `focus` and a 2px ring at 20% opacity appears. No glow.
- **Label:** 14px medium, `ink-2`, above the control. The error message sits below in `danger` at 12px; a hint sits below in `muted` at 12px.
- **Disabled:** `page` fill, `muted` text.

### Navigation
- **Bottom tab bar (below `lg`):** `surface` at 95% opacity with an 8px backdrop blur, a 1px `rule` top border, and the safe-area inset below. Five equal columns, each 56px tall. Each item is an icon above an 11px medium label. Inactive items are `muted`; the active item is `accent`.
- **More sheet:** the fifth item opens a bottom sheet listing Certifications, Documents, Review, Prompt, and Sign out. Each link is 48px tall (`min-h-12`) with a 20px icon.
- **Sidebar (from `lg`):** 240px wide, `surface` background with a 1px `rule` right border. Items are 14px text with 8px vertical padding and an 8px radius. The active item is `accent-tint` with `accent` text in semibold.
- **Focus:** the base outline, inset by 2px on tabs and rows, because the scrolling containers would clip an outline drawn outside.

### Floating Action Button
- **Style:** pill, `accent` fill, `on-accent` text, 52px tall, 16px left and 20px right padding, 20px plus icon, 16px semibold label. It sits 16px from the right edge and 72px plus the safe-area inset above the bottom.
- **Behaviour:** below `lg` only. It presses to 95% scale on `:active` unless motion is reduced. From `lg` the same action is a "Log session" button in the page header.

### Sheets and Dialogs
- **Phone:** a bottom sheet with 16px top corners, anchored to the bottom, at most 92dvh tall and scrollable. Its bottom padding is `max(1.25rem, env(safe-area-inset-bottom))`.
- **From `sm`:** a centred dialog with 12px corners, `max-w-lg` (or `max-w-2xl` when wide), 24px padding.
- **Focus:** opening moves focus into the sheet (or leaves it on a field with `autoFocus`), Tab and Shift+Tab wrap inside it, and closing returns focus to whatever opened it. A confirm dialog opened over a sheet owns Escape and Tab while it has focus.
- **Segmented control:** inside a dialog, a two-option tab row on a `sunken` track with 2px inset, and the active option on `surface` with a `shadow-sm`.

### Motion
- **Check fill:** the circle pops to 118% and back over 260ms (`ease-out`) and the check draws in over 240ms after a 60ms delay. Both run only on a tap, and only when motion is not reduced.
- **Strike:** a done title is struck by a 1px `currentColor` background line that grows from 0 to 100% width over 240ms (`box-decoration-clone`, so each wrapped line strikes).
- **State transitions:** colour changes on rows, checks, and buttons use a 150 to 200ms colour transition.
- **Reduced motion:** the pop, draw, strike, check and title colour fades, and the FAB press scale are all gated on `motion-safe`, so the done state swaps in at once.

## Do's and Don'ts

### Do:
- **Do** use one accent call to action per dialog or screen.
- **Do** write colour as a semantic token (`bg-accent`, `text-muted`, `bg-surface`). Every token has a light and a dark value in `index.css`.
- **Do** keep status and kind tones consistent with `tones.ts`. Adding a value means adding its tone there.
- **Do** keep touch targets at least 44px tall on phone (`min-h-11`), and 56px for list rows and tabs (`min-h-14`).
- **Do** keep form inputs at 16px on phone.
- **Do** pad fixed bottom elements with `env(safe-area-inset-bottom)`, and use `min-h-dvh` on the shell.
- **Do** use bottom sheets on phone and centred dialogs from `sm`.
- **Do** use tabular numerals for counts, durations, and dates that are compared.
- **Do** show overdue state in `danger` text, not with a red fill on the whole row.

### Don't:
- **Don't** add a second accent colour for branding. The accent is indigo.
- **Don't** hard-code a colour value in a component. The only raw colour values are in `src/index.css`, apart from the danger button's literal white text.
- **Don't** give a resting group, row, or card a shadow, or stack more than one shadow on an element.
- **Don't** remove the focus ring from interactive elements.
- **Don't** add a top tab row or underlined tabs back into the phone layout. Navigation is the bottom bar.
- **Don't** introduce a custom display typeface. The system stack is the product's voice.
