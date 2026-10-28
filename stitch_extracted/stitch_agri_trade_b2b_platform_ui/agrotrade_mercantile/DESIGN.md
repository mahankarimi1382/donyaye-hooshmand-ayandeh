---
name: AgroTrade Mercantile
colors:
  surface: '#f1fcf4'
  surface-dim: '#d1ddd5'
  surface-bright: '#f1fcf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ebf6ee'
  surface-container: '#e5f1e8'
  surface-container-high: '#dfebe3'
  surface-container-highest: '#dae5dd'
  on-surface: '#141e19'
  on-surface-variant: '#414844'
  inverse-surface: '#28332d'
  inverse-on-surface: '#e8f4eb'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#2e6948'
  on-secondary: '#ffffff'
  secondary-container: '#afeec3'
  on-secondary-container: '#336e4c'
  tertiary: '#352400'
  on-tertiary: '#ffffff'
  tertiary-container: '#503800'
  on-tertiary-container: '#cf9f3f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#b2f1c6'
  secondary-fixed-dim: '#96d4ab'
  on-secondary-fixed: '#002110'
  on-secondary-fixed-variant: '#125132'
  tertiary-fixed: '#ffdea6'
  tertiary-fixed-dim: '#f2bf5b'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5d4200'
  background: '#f1fcf4'
  on-background: '#141e19'
  surface-variant: '#dae5dd'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 52px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-badge:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  data-tabular:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system serves a specialized B2B animal feed and raw commodity logistics infrastructure. The interface bridges the structured precision of Swiss modernist typography with Iranian mercantile trade standards, accommodating bidirectional data streams with native Right-to-Left (RTL) precedence.

The brand persona is authoritative, institutional, and operationally rigorous. It speaks directly to procurement heads, livestock holding corporations, and port logistics coordinators. The visual tone eliminates superfluous marketing fluff in favor of ledger-grade clarity: document tracking IDs, Harmonized System (HS) classifications, Incoterms 2020 delivery statuses, and certified assay tables.

The aesthetic philosophy centers on **Technical Rationalism**:
- High-density information grids that mimic official customs bills and proforma invoices.
- Warm, tactile foundational paper tones paired with deep forestry greens, echoing agricultural stewardship, raw grain origins, and institutional trust.
- Monospaced notation strips for international trade codes embedded seamlessly alongside Persian calligraphic structure.

## Colors

The palette draws directly from agricultural commodity shipping, deep silo structures, and physical bills of lading:

- **Primary (`#1B4332`)**: Forest Green evokes established institutional equity, maritime cargo integrity, and raw agro-industrial supply. Used for primary CTAs, main titles, high-priority navigation markers, and header bars.
- **Secondary (`#3D7855`)**: Fresh Leaf Green serves as the interactive state tone for focus rings, hover indicators, verified status indicators, and secondary actions.
- **Tertiary (`#C99A3A`)**: Grain Amber accents critical metadata such as customs classification codes (HS Codes), proforma urgency tags, metric weights, and laboratory certificate seals.
- **Neutral Primary Text (`#17211C`)**: Deep Charcoal with subtle green undertones, ensuring high legibility for Persian glyphs and alphanumeric commodity specifications.
- **Surfaces & Backgrounds**:
  - `Canvas / Body Background`: `#FAF8F1` (Warm Muted Rice Paper).
  - `Card / Sheet Surface`: `#FFFFFF` (Pure Card Surface).
  - `Deep Pine Substrate`: `#102820` (Reserved for operational footers, deep hero banners, and high-impact RFQ summary banners).
  - `Structural Border & Dividers`: `#DDE5DE` (Subtle greenish stone gray for razor-sharp 1px data boundaries).
  - `Badge / Pill Fill`: `#F0F4F1` (Desaturated tint for technical attribute tags).

## Typography

The typographic hierarchy accommodates a bilingual Persian (Farsi) and international trade framework:

- **Primary Headings**: Modernist grotesque architecture with bold geometric presence for document titles, commodity classifications, and macro metrics. For Farsi scripts, the design system pairs naturally with *Vazirmatn* for matched weights (400, 600, 700).
- **Body & Forms**: Engineered sans-serif typography characterized by neutral terminal endings, wide apertures, and reliable legibility in high-density commodity forms, assay tables, and proforma conditions.
- **Technical & Alphanumeric Metadata**: Monospaced typography reserved exclusively for HS codes (`HS: 100590`), Incoterms 2020 tokens (`FOB`, `CFR`, `CIF`), batch weights (`500 MT`), reference identifiers, and shipment checksums.
- **RTL & BDI Handling**: All numeric strings, HS code prefixes, and metric units are isolated within `<bdi>` tokens with `dir="ltr"` inline styling to prevent punctuation flipping and misaligned digit rendering across RTL flow.

## Layout & Spacing

The layout is built on a rigid **8px modular rhythm**, derived from structured commercial ledger tables and international customs manifests:

- **Desktop (1200px - 1440px+)**: 12-column responsive layout with 24px (`1.5rem`) gutters and 32px (`2rem`) outer canvas margins. RFQ forms and product catalogs utilize asymmetric split screens (60/40 or 70/30) to juxtapose live procurement feeds against interactive inquiry forms.
- **Tablet (768px - 1024px)**: 8-column layout with 24px gutters and 24px margins. Technical spec tables switch to horizontal-scroll viewports with sticky first columns.
- **Mobile (320px - 640px)**: 4-column layout with 16px (`1rem`) gutters and 16px margins. Quick RFQ sidebars stack beneath the primary commodity specifications.
- **Ticker & Header Strip**: Fixed 36px top technical ticker providing real-time port logistics announcements, loading queue indexes, and commodity exchange statuses.

## Elevation & Depth

This design system avoids heavy drop shadows, opting instead for **tactile borders and crisp architectural planes**:

- **Default Layering (Level 0 - Canvas)**: `#FAF8F1` serves as the continuous unprinted paper foundation.
- **Surface Layering (Level 1 - Sheets & Cards)**: Pure white `#FFFFFF` planes defined by a single 1px solid border (`#DDE5DE`).
- **Elevated Interactive Components (Level 2 - Quick Inquiries & Modals)**: Subtle, diffused ambient shadow with an olive-neutral cast to preserve the organic commodity atmosphere:
  - `box-shadow: 0 4px 16px -2px rgba(27, 67, 50, 0.08), 0 1px 3px 0 rgba(27, 67, 50, 0.04);`
- **Focus & Selection**: Crisp, double-ring indicator consisting of 1px `#FFFFFF` interior border and 2px `#1B4332` exterior perimeter ring. No fuzzy outer glows.
- **Active Document Headers**: Underlined by a sharp 2px solid `#1B4332` rule, emphasizing legal and mercantile validity.

## Shapes

The shape hierarchy follows **Soft Minimalist Industrial Geometry** (Roundedness Level 1):

- **Data Tables, Input Fields & Form Controls**: 4px (`0.25rem`) corner radius. This communicates strict administrative structure and engineering precision.
- **Commodity Cards & Document Sheets**: 6px to 8px (`0.375rem` - `0.5rem`) corner radius, maintaining a clean boundary while softening high-volume grid lists.
- **Technical Chips & Incoterm Pills**: 4px radius for code tags; 9999px (full pill) exclusively for live operational indicators like "Active Port Intake" or "Lab Assay Verified".

## Components

### Buttons & Action Controls
- **Primary CTA**: Background `#1B4332`, text `#FFFFFF`, border none, height 44px, padding horizontal 20px, radius 4px. Hover: `#102820`. Active: `#0B1B15`.
- **Secondary / Technical Outlined**: Background transparent, border 1px solid `#DDE5DE`, text `#1B4332`. Hover: Background `#F0F4F1`.
- **Amber Action Button**: Background `#C99A3A`, text `#102820`, font weight 600. Reserved for high-value transactional conversions ("Submit RFQ").

### Input Fields & Select Menus
- Background `#FFFFFF`, height 44px, border 1px solid `#DDE5DE`, padding 8px 12px.
- Focus state: Border color `#1B4332`, ring 1px `#1B4332`.
- Form label: 13px, weight 500, color `#17211C`. Required indicators rendered in `#C99A3A`.
- Monospace input variant: Applied to quantities, customs codes, and document tracking IDs with `JetBrains Mono` formatting.

### Technical Data Tables (Assay & Specs)
- Header row: Background `#F0F4F1`, text `#1B4332`, 12px uppercase/bold, border-bottom 1px solid `#DDE5DE`.
- Cell rows: Background `#FFFFFF`, alternating rows with `#FAF8F1`, cell padding 12px 16px, 1px bottom border.
- Numeric columns: Right-aligned for LTR contexts, left-aligned for RTL Persian figures, with explicit unit tagging (`MT`, `%`, `ppb`).

### Chips, Badges & Metadata Tags
- **HS Code Badge**: Background `#FAF8F1`, border 1px solid `#C99A3A`, text color `#C99A3A`, font `JetBrains Mono`, font-size 11px, radius 3px.
- **Incoterm Chip**: Background `#F0F4F1`, border 1px solid `#DDE5DE`, text `#1B4332`, font-weight 600.
- **Logistics Status Badge**: Left/Right colored 6px dot indicator (green for open ports, amber for customs inspection, red for embargo).

### Commodity Cards
- Pure `#FFFFFF` surface, 1px `#DDE5DE` perimeter stroke.
- Header contains HS classification and loading terminal on a single row separated by a subtle dividing line.
- Content stack: Bold commodity designation, key chemical assay highlights (protein, moisture, aflatoxin thresholds), MOQ chip array, and dual-action footer ("Tech Sheet" / "Inquire").

### Tracking & Quick RFQ Panel
- Border 1px solid `#DDE5DE`, soft card shadow, distinct top strip accented with the Golden Amber (`#C99A3A`) brand rule.
- Native RTL layout with clear Persian microcopy for rapid port verification.