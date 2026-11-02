---
name: intermediary
description: A personal planner where intentions and logged reality sit side by side, reviewed before any AI change applies.
colors:
  signal-blue: "oklch(54.6% 0.245 262.881)"
  signal-blue-hover: "oklch(48.8% 0.243 264.376)"
  signal-blue-tint: "oklch(97% 0.014 254.604)"
  focus-blue: "oklch(62.3% 0.214 259.815)"
  ink-strong: "oklch(21% 0.034 264.665)"
  ink-body: "oklch(37.3% 0.034 259.733)"
  ink-muted: "oklch(55.1% 0.027 264.364)"
  ink-subtle: "oklch(70.7% 0.022 261.325)"
  rule: "oklch(92.8% 0.006 264.531)"
  surface-page: "oklch(98.5% 0.002 247.839)"
  surface-column: "oklch(96.7% 0.003 264.542)"
  surface-card: "#ffffff"
  danger: "oklch(57.7% 0.245 27.325)"
  danger-hover: "oklch(50.5% 0.213 27.518)"
  danger-tint: "oklch(97.1% 0.013 17.38)"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    letterSpacing: "-0.025em"
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
rounded:
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  2xl: "1rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.surface-card}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.875rem"
  button-primary-hover:
    backgroundColor: "{colors.signal-blue-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink-body}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.875rem"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface-card}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.875rem"
  button-ghost:
    textColor: "{colors.ink-muted}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.875rem"
  input:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
  pill:
    rounded: "{rounded.full}"
    typography: "{typography.label}"
    padding: "0.125rem 0.625rem"
---

# Design System: intermediary

## Overview

**Creative North Star: "The Quiet Ledger"**

intermediary is a record. It keeps what you meant to do next to what actually happened, and the screens should read like a careful ledger: neutral paper, one clear mark for what is live, and no decoration that competes with the entries. The product is a single person's working tool, so the system favors legibility over atmosphere. Density is moderate. Lists, boards, and forms stay scannable at a glance, and the week is the largest object on the page.

The surfaces are flat. Cards and columns are separated by hairline rules and a very light shadow, not by gradients or glow. Color is rationed: the signal blue marks what is active or actionable, and the status palette is the only other color on a screen. Everything is light-mode only; the page declares `color-scheme: light`.

Type is the system UI stack, sized small and set in Tailwind's default scale. Hierarchy comes from weight, size, and gray value, not from a display face.

**Key Characteristics:**
- Flat surfaces with hairline borders; shadow only on overlays and drag state.
- Neutral gray scale with one accent (signal blue) and a status palette.
- Dense but legible; the week and the status board are the primary objects.
- System UI typography; no custom font loading.
- Light mode only.

## Colors

The palette is Tailwind v4's default scale, used by role. There are no custom brand colors, and that is intentional: the accent and neutrals are chosen for legibility and to read as a ledger.

### Primary
- **Signal Blue** (`blue-600`): the one live-state color. It fills primary buttons, marks the active nav tab, colors text links (underlined on hover), and carries the focus indicator on links, tabs, cards, inputs, and primary buttons. Secondary and ghost buttons ring in gray. It should stay rare on any given screen.
- **Signal Blue Hover** (`blue-700`): the pressed and hovered state of primary buttons.
- **Signal Blue Tint** (`blue-50`): the background of an active drop target on the board and the calendar.
- **Focus Blue** (`blue-500`): input border on focus, with a `blue-500` ring at 20% opacity. Button focus rings use the same hue at 40%.

### Neutral
- **Ink Strong** (`gray-900`): page titles and primary text.
- **Ink Body** (`gray-700`): labels, form labels, and secondary buttons.
- **Ink Muted** (`gray-500`): subtitles, metadata, and section labels.
- **Ink Subtle** (`gray-400`): placeholders and "No date" markers.
- **Rule** (`gray-200`): card borders and dividers. Hover raises it to `gray-300`.
- **Surface Page** (`gray-50`): the page background.
- **Surface Column** (`gray-100`): board and calendar column backgrounds, with white cards on top.
- **Surface Card** (`white`): cards, inputs, dialogs, and the sticky header at 90% opacity.

### Status
- **Status Palette**: each enum value has one tone everywhere it appears, mapped in `src/components/ui/Pill.tsx`. Blue for study and in-progress, amber for scheduled or deferred, violet for interviewing or apply, green for done, offer, or passed, red for rejected or failed, teal for exercise, orange for writing, gray for planned or neutral, slate for ghosted or canceled.
- **Danger** (`red-600`): destructive buttons, overdue dates, and error text. Hover uses `red-700`.

### Named Rules
**The One Signal Rule.** Signal blue marks the one thing the user can act on right now. A screen with several blue calls to action has lost its order.

**The Honest Status Rule.** A status carries the same tone on every screen. Never assign a status a second color because a layout looks better that way.

## Typography

**Display Font:** system UI stack (`ui-sans-serif, system-ui, sans-serif`). The stack adds the platform emoji faces as fallbacks.
**Body Font:** the same stack.
**Label/Mono Font:** the same stack for labels. Monospace (`ui-monospace` stack) is reserved for machine-facing text: file paths on Documents, the calendar feed URL, and the Prompt page's Markdown and JSON output.

**Character:** plain and quiet. The page title does the work, and everything else steps down in weight and gray value.

### Hierarchy
- **Display** (600, 1.5rem, tracking -0.025em): page titles, such as "Dashboard" and "Plan." One per screen.
- **Title** (600, 1.125rem): dialog titles and section headings inside a modal or panel.
- **Body** (400, 0.875rem): the default for forms, rows, and card text. Most of the interface is this size.
- **Label** (500, 0.75rem): status pills, date stamps, and the hints under columns.
- **Stat** (600, 1.5rem, tabular numerals): the big number on each dashboard tile. Numerals align in columns.
- **Section label** (600, 0.875rem, uppercase, tracking 0.025em, `gray-500`): the heading above a list, such as "Up next" or "Recent changes."

### Named Rules
**The Tabular Numbers Rule.** Any figure that a user compares across tiles or rows uses tabular numerals.

## Layout

A single centered column, 72rem (`max-w-6xl`) wide, with a 1rem gutter on phones and 1.5rem from the `sm` breakpoint up. The header is sticky, white at 90% with a backdrop blur, and holds a horizontally scrolling tab row so that all eight screens stay reachable on narrow widths.

The dashboard uses a two-column stat grid on phones and a four-column grid from `md`. Its main content splits into two columns from `lg`.

The Plan board is horizontal: status columns are 18rem (`w-72`) wide and scroll sideways. The calendar week reflows across breakpoints, from two to four to seven day columns. A card in a day column drops its status pill below the title to fit the narrow width.

Spacing follows a 4px base (Tailwind's `--spacing`). Most gaps are 0.5rem, 1rem, or 1.5rem, and section breaks use 2rem. Vertical rhythm inside a card is tight, with 0.5rem between a title and its metadata line.

## Elevation & Depth

The system is flat by default. Depth comes from hairline borders and tonal columns, not from shadows.

### Shadow Vocabulary
- **Resting** (`shadow-xs`): cards, inputs, and the Dashboard tiles. A two-pixel-blur shadow, barely visible.
- **Hover** (`shadow-sm`): a plan item card when hovered, paired with a darker border. This is the only shadow that appears on a hover state.
- **Drag preview** (`shadow-lg`, with `rotate-1` and a `blue-300` border): the card that follows the pointer during a drag.
- **Popover** (`shadow-xl`): the floating drag overlay used on the Plan page.
- **Modal** (`shadow-2xl` with a `gray-900` 5% ring): dialogs and the review panel.

### Named Rules
**The Hairline Rule.** Surfaces are separated by a one-pixel `gray-200` border before they are separated by a shadow. A shadow is added only to show that something is floating above the page.

## Shapes

The form language is modest and consistent. Controls (buttons, inputs) use a 0.375rem radius (`md`). Containers (cards, columns, lists, dialogs) use 0.75rem (`xl`). Small item cards on the board use 0.5rem (`lg`). Status pills and the "today" date badge are fully round (`full`). The login card is the one place at 1rem (`2xl`).

Borders are one pixel. There are no decorative shapes, dividers with ornament, or illustrations.

## Components

Each component is a plain, precise version of the usual pattern. Nothing decorates the component itself.

### Buttons
- **Shape:** 0.375rem radius on every variant. Padding is 0.5rem by 0.875rem at the default size, and 0.25rem by 0.625rem at the small size.
- **Primary:** Signal Blue fill, white text, medium weight. Hover moves to Signal Blue Hover.
- **Secondary:** white fill, one-pixel `gray-300` border, Ink Body text. Hover fills to `gray-50`.
- **Danger:** `red-600` fill, white text, used only in confirmation dialogs.
- **Ghost:** no fill, Ink Muted text. Hover shows a `gray-100` fill and darker text.
- **Focus:** a two-pixel ring in the variant's hue at 40% opacity. Focus is never removed.
- **Disabled:** 50% opacity with a not-allowed cursor.

### Pills
- **Style:** fully round, label type, 0.125rem by 0.625rem padding. The tone fills the background and sets the text, from the status palette.
- **State:** a pill never changes state on its own. Its tone is set by the value it names.

### Cards / Containers
- **Corner Style:** 0.75rem radius on cards, Dashboard tiles, and list containers.
- **Background:** white, on a `gray-50` page or a `gray-100` column.
- **Shadow Strategy:** `shadow-xs` at rest. See Elevation.
- **Border:** one pixel `gray-200`. Overdue lists take a `red-200` border instead.
- **Internal Padding:** 1rem on a card. Lists within a card use 1rem horizontal and 0.625rem vertical per row.

### Inputs / Fields
- **Style:** white fill, one-pixel `gray-300` border, 0.375rem radius, 0.5rem by 0.75rem padding, small shadow.
- **Focus:** the border moves to Focus Blue and a two-pixel ring at 20% opacity appears. No glow.
- **Error:** the error message appears below the control in `red-600`, with the field's label unchanged.
- **Disabled:** `gray-50` fill, Ink Muted text.

### Navigation
- **Style:** a horizontal row of text tabs under the header. Each tab has a two-pixel bottom border.
- **Typography:** body size. The active tab is Ink Strong with a medium weight and a Signal Blue bottom border. Inactive tabs are Ink Muted and turn Ink Strong on hover, with a `gray-300` bottom border.
- **Mobile:** the same row, scrolled horizontally. It does not collapse into a menu.
- **Focus:** the base Focus Blue outline, inset by 2px, because the scrolling row would clip an outline drawn outside the tab.

### Focus
- **Default:** every focusable element without its own focus style (links, nav tabs, plan cards, row actions) gets a 2px Focus Blue outline offset by 2px, from a base-layer rule in `src/index.css`.
- **Own ring:** buttons and inputs keep the ring described above, since a utility class outranks the base rule.
- **Clipping:** inside a scrolling container that clips overflow, inset the outline instead (`-outline-offset-2`).

### Plan Board Cards
- **Shape:** 0.5rem radius, one-pixel `gray-200` border, 0.75rem padding.
- **Title:** body size, medium weight. A done item has its title struck through and in `gray-500`.
- **Metadata:** label size, Ink Muted, with a middle dot between date and reference. An overdue date is `red-600`.
- **Drag:** the source card fades to 30% opacity. The overlay card tilts by one degree, takes a Signal Blue border, and carries `shadow-lg`.

### Board Columns
- **Shape:** 0.75rem radius, one-pixel border. Idle columns are `gray-100` at 70% opacity. A column over which a card is dragged gets a Signal Blue border and the Signal Blue Tint.
- **Header:** a title in semibold body size, a hint in label size, and a count in a white pill with a `gray-200` ring.

## Do's and Don'ts

### Do:
- **Do** use one Signal Blue primary action per dialog or panel.
- **Do** keep status tones consistent with `Pill.tsx`. Adding a status means adding its tone there.
- **Do** separate surfaces with a one-pixel border first and a shadow second.
- **Do** use tabular numerals for counts, durations, and dates that are compared.
- **Do** show overdue state in `red-600` text, not with a red fill on the whole card.
- **Do** leave focus to the base Focus Blue outline unless the element has its own ring, and inset it where a container would clip it.

### Don't:
- **Don't** add a second accent color for branding. The accent is the signal blue.
- **Don't** use gradients, glow, or frosted panels. The sticky header's 90% white blur is the only translucency in the system.
- **Don't** add dark mode styles without a decision to support it. The page declares light only.
- **Don't** give a resting card anything heavier than `shadow-xs`, or stack more than one shadow on an element.
- **Don't** remove focus rings from interactive elements.
- **Don't** introduce a custom display typeface. The system stack is the product's voice.
