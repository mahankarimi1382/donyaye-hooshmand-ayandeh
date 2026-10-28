# DESIGN_SPEC — «ترازنامهٔ بندری» / Port Ledger

Design language for the Karvan platform. This document is the single source of truth for every visual decision. If a component choice is not covered here, derive it from the principles in §1 — never from default library styling.

---

## 1. Concept and principles

The platform **is a stack of trade documents brought to life**: bill of lading, proforma invoice, customs declaration, ledger page. Warm manila-paper surfaces, ruled hairlines, double-rules over totals, rubber-stamp status marks, typewriter-grade monospace for codes and money. Authority comes from *bureaucratic precision rendered beautifully* — never from gradients, glass, or glow.

Four rules that follow from this:

1. **Ornaments are documents, not decoration.** Stamps, ledger rules, perforations, manifest numbers, dimension leaders — every visual element encodes a real domain artifact.
2. **One saturated accent.** Stamp-red is the only loud color. Everything else is ink on paper.
3. **Crisp edges.** Radii are 0–2px. Elevation is a hairline plus a 1–2px offset "print register" shadow, not blur.
4. **Persian-first craft.** RTL is native (logical properties), Farsi digits in prose, line-height 1.8 for Persian body text, no letter-spacing on Persian ever.

## 2. Color tokens

CSS custom properties, defined in `packages/ui` (`tokens.css`), consumed by Tailwind 4 via `@theme`. Every token has a light and dark value; dark is "warehouse at night" — same desk under tungsten light.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-paper` | `#F2EEE5` | `#181510` | Page background |
| `--color-sheet` | `#FBF9F3` | `#211D16` | Cards, panels, tables ("a form sheet on the desk") |
| `--color-well` | `#E9E3D6` | `#2A241A` | Table headers, sunken wells, sidebar |
| `--color-ink` | `#201C15` | `#EDE7D9` | Primary text, ink buttons |
| `--color-ink-soft` | `#5C564A` | `#B3AB99` | Secondary text |
| `--color-ink-faint` | `#8A8271` | `#7D7565` | Placeholders, disabled, annotations |
| `--color-rule` | `#D8D0BE` | `#3A342A` | Hairlines, borders, ledger rules |
| `--color-rule-strong` | `#B9AF98` | `#4A4335` | Hover borders, 2px emphasis rules |
| `--color-harbor` | `#1F4E5F` | `#7FB5C4` | Primary actions, links, selection |
| `--color-harbor-deep` | `#153A48` | `#9CC8D4` | Primary hover |
| `--color-stamp` | `#B3372B` | `#D96A55` | Accent: stamps, active marks, brand moments |
| `--color-clear` | `#3D6B45` | `#8DB58A` | Success ("cleared" green) |
| `--color-ochre` | `#8F5F0B` | `#C9973B` | Warning |
| `--color-seal` | `#9C2B21` | `#E08573` | Danger |
| `--color-observed` | `#2A5A78` | `#7FA8C0` | Info |
| `--color-chart-1..4` | `#1F4E5F` `#8F5F0B` `#3D6B45` `#2A5A78` | lighter equivalents | Analytics charts only |

Contrast: every text token passes WCAG AA 4.5:1 on its own background in both modes. Never introduce a color outside this table; if a new need appears, extend the table here first.

Status → color mapping (used by `StampBadge`, tables, timelines): `draft`/`cancelled`/`expired` → ink-faint; `submitted`/`under_review` → observed; `needs_information` → ochre; `qualified` → harbor; `quote_preparation` → ochre; `quoted`/`sent` → harbor; `internal_review` → ochre; `approved` → clear; `accepted`/`completed`/`delivered` → clear; `rejected`/`declined` → seal; `confirmed` → observed; `in_execution` → ochre; `booking_confirmed` → harbor.

## 3. Typography

Self-hosted via Fontsource packages, imported once in the UI package. Google Fonts is banned at runtime.

| Role | Font | Weights | Notes |
|---|---|---|---|
| Persian + Latin body/UI | Vazirmatn Variable | 400/500/700 | line-height 1.8 body, 1.35 headings |
| Display / oversized numerals | Lalezar | 400 only | fa headlines, ghost numerals, KPI meganumbers; falls back to Vazirmatn 700 in `en` if it reads poorly |
| Codes, money, timestamps | IBM Plex Mono | 400/500 | HS codes, container numbers, prices in tables, IDs |

Type scale (desktop px / line-height): Display 64/1.2 (Lalezar) · H1 40/1.3 · H2 28/1.4 · H3 20/1.5 · Body 16/1.8 · Small 14/1.7 · Mono meta 13/1.5 · Ghost numeral 120/1 at 8% ink opacity. Vertical rhythm snaps to 8px; line-heights to the values above.

**Number conventions (signature, never violate):**
- Persian prose, headings, KPI numerals → Farsi digits (۰–۹), Vazirmatn/Lalezar.
- Data tables, money, codes, timestamps, IDs → Latin digits, IBM Plex Mono, wrapped in `<bdi>` when mixed into RTL text.
- Dates display in Jalali (`fa-IR-u-ca-persian`); storage is ISO Gregorian.

## 4. Layout and structure

- 12-column grid, 72px gutters on desktop. Content max-width 1280px.
- **Ledger margin**: a vertical hairline 24px inside the content edge on marketing pages, with small mono margin annotations (like form-binding marks).
- Section spacing 64/96. Base unit 8px.
- Radii: 0px for inputs/tables, 2px for sheets/cards/stamps. Nothing larger, ever.
- Elevation: `box-shadow: 2px 2px 0 rgb(32 28 21 / 0.08)` (print register). Popovers may use `4px 4px 0 …`. No blur shadows, no glass.
- **Page header is a manifest header**: Lalezar headline + a mono metadata strip (شماره سند · تاریخ · مرجع) over a hairline; page sections open with `۰۱ — عنوان` numbered titles over a 120px ghost numeral.

## 5. Component inventory (packages/ui)

Every component: RTL-aware via logical properties (`ms-*/me-*/ps-*/pe-*`, `start-*`/`end-*`), forwardRef, `cn()` from clsx+tailwind-merge, focus-visible = 2px `--color-harbor` ring offset 2px, WCAG AA, `prefers-reduced-motion` respected.

1. **Button** — variants: `ink` (solid ink slab, primary), `harbor` (solid harbor), `outline` (1px rule, transparent), `ghost`, `danger`. Sizes sm 32 / md 40 / lg 48. Radii 2px. Loading state = inline mono spinner, text unchanged.
2. **StampBadge** — status chip drawn as a rubber stamp: 2px double border (outline + inner hairline), status color, 2px radius, `rotate(-2deg)`, uppercase mono text beside Persian label. On "applied" moments (status just changed) it lands: scale 1.12→1, rotate −6°→−2°, 220ms. Never more than 3 stamps per viewport.
3. **LedgerTable** — the core table. Densities: `comfortable` 48px, `compact` 32px rows. Hairline row rules, sticky header on `--color-well`, hover = `#F6F1E6` tint, numeric columns right-aligned LTR (numbers never mirror), first column mono, **double 3px rule above totals rows**, optional row-leading 3px status edge (instead of pills).
4. **FormField / Input / Textarea / Select** — inputs look like filled-in form cells: `--color-sheet` background, 1px rule border, 2px radius, mono text inside inputs; error = seal-colored 2px border + stamp-fragment error text with `role="alert"`; label + required mark; `aria-describedby` wiring.
5. **Stepper** — RFQ wizard stepper: numbered circles (mono digits) joined by a 2px rule that *grows* with progress; completed = harbor fill + check; current = ink ring; clickable only for completed steps. Mirrors in RTL automatically.
6. **Notice** (alert) — bordered sheet strip with a mono tag (`یادداشت`, `هشدار`, `ممنوع`) + icon + text; variants info/success/warning/danger; `role` per severity. Used for legal notices and system messages.
7. **EmptyState** — a stamped "NO ENTRY" style panel: dashed 1px rule border, Lalezar short title, mono sub-code, optional action.
8. **IncotermChip** — mono chip `FOB / بندرعباس`, `<bdi>`-isolated, 1px rule border, per-term tint from status palette (FOB harbor, CIF clear, EXW ochre, DAP observed, CFR ink-soft).
9. **QuoteSheet** — the proforma document view: document code header, perforation divider, parties grid, line-item LedgerTable with dotted leader lines between label and value in financials, double-rule grand total, SHA-256 checksum strip at the bottom in mono.
10. **RouteTimeline** — shipment progress: a dotted SVG route line (harbor) through 9 milestone waypoints; completed waypoints = filled harbor dots, current = pulsing ring (2s, reduced-motion off), future = hollow. Waypoint labels mono; mirrors in RTL. Used in trade-case cockpit and portal order page.
11. **Tabs** — underline tabs with a 2px stamp-red active underline, mono labels allowed.
12. **KpiTile** — sheet panel with mono label, Lalezar Farsi numeral value, delta line (mono, arrow mirrors in RTL).
13. **Ticker** — a continuous mono marquee strip of FX/freight indices (`USD ۶۱٬۴۲۰ IRR · SCFI 1,742 ▼ 0.8%`) under the public header; 60px/s, pauses on hover, static when reduced-motion.
14. **PageHeader** — manifest header component (title, mono meta strip, optional actions slot).
15. **Perforation** — ticket-perforation divider: dashed hairline with half-circle notches.
16. **SectionHeader** — numbered section opening (`۰۱ — عنوان`) with ghost numeral behind.

## 6. Motion

Library: CSS transitions for 90% of cases; `motion/react` for the wizard, RouteTimeline draw, and stamp landing. Never GSAP.

- Animates: stamp landing, stepper rule growth, route-line drawing (once per view), ticker marquee, KPI numeral count-up (once, 400ms), row hover tint.
- Never animates: table data, form inputs while typing, page scroll (no parallax, no scroll-jack, no fade-up-on-every-block).
- Easing: `cubic-bezier(0.2, 0.7, 0.2, 1)`. Durations 160–240ms (hover), 220–400ms (choreography).

## 7. RTL / LTR rules

- Logical properties only; `dir` set on `<html>` by locale (fa=rtl default, en=ltr).
- Mirror: nav, breadcrumbs, steppers, timelines, chevrons, delta arrows, margin annotations.
- Never mirror: logos, media controls, numeric table columns (align by decimal), charts (time axis stays LTR; wrap recharts in `dir="ltr"` and mirror page-level chrome yourself).
- Bidi: every Incoterm, HS code, container number, ID, and mixed-direction string wrapped in `<bdi>`. No unicode override controls.

## 8. Signature elements (what makes it unmistakably Karvan)

1. Rubber-stamp status badges at −2°.
2. Ledger tables with double-rule totals and dotted leaders.
3. Manifest-numbered sections with ghost numerals.
4. Perforation dividers between document-like panels.
5. The FX/freight ticker under the public header.
6. Margin hairline with binding marks on marketing pages.
7. Checksum strips (SHA-256) under every immutable document.

## 9. The AVOID list (violating any of these is a review failure)

- No purple/indigo/violet, no gradients anywhere, no `bg-clip-text`.
- No glassmorphism, no blur-backdrop panels, no glow.
- No `rounded-xl`+`shadow-lg` combos, no radius above 2px.
- No emoji anywhere in UI or code.
- No uniform 3-column icon-card grids; layouts are asymmetric and editorial.
- No Inter/system-ui as identity font; no letter-spacing on Persian.
- No fade-up-on-scroll on every block; no parallax.
- No placeholder copy (Lorem, "Streamline your workflow…"), no stock AI illustration style.
- No colored pill status dots alone — status always carries text + color.
- No default Tailwind palette values in components — everything through tokens.
