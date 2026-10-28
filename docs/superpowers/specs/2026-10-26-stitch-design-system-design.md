# Design Document: Adoption of Stitch AgriTrade B2B Platform UI

**Date:** 2026-10-26  
**Status:** Approved for Implementation Planning  
**Target:** Donyaye Hooshmand Ayandeh (شرکت بازرگانی دنیای هوشمند آینده)  
**Reference Package:** `stitch_agri_trade_b2b_platform_ui.zip` (`agrotrade_mercantile/DESIGN.md`, `material_3_dynamic`, `google_omnibox_store`)

---

## 1. Intent and Why

The user provided a new, high-fidelity UI/UX design package exported from Stitch (`stitch_agri_trade_b2b_platform_ui.zip`) specifically tailored for **Donyaye Hooshmand Ayandeh**, an Iranian B2B commercial enterprise specializing in animal feed raw materials (غلات دامی و کنجاله‌های پروتئینی).

The goal is to adopt this design system across the entire frontend application, elevating it from generic corporate templates to an authoritative, institutional, and operationally rigorous mercantile platform built on **Technical Rationalism** and **Google Material 3 (M3) Dynamic UI**.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Token Harmonization:** Map the M3 Dynamic color tokens (`primary: #1B4332`, `primary-container: #d8f3e5`, `secondary: #2D6A4F`, `tertiary: #C99A3A`, `surface: #F8FAF8`, `surface-container: #E5F1E8`) into Tailwind CSS v4 `@theme` and `@karvan/ui` design tokens.
- **Top Port Logistics Ticker:** Implement the live terminal ticker bar (`sensors`, BIK berth status, Amirabad Caspian terminal, SGS & ISO certifications) across the site header.
- **Hero & Interactive Hub:** Introduce the Google Flights-inspired multi-pill interactive quotation hub and the Google Omnibox search capabilities for instant commodity lookups.
- **Feed Commodity Cards:** Redesign product cards with M3 elevation, soft-pill chemical and physical assay badges (Protein, Moisture, Aflatoxin < 10 ppb, KOH solubility, Urease activity), MOQ chips, and direct RFQ modal triggers.
- **B2B RFQ Sheet:** Overhaul the RFQ intake form and detail views into official mercantile sheets with clean 4px border-radius inputs, company credentials, and instant SLA assurances.
- **Responsive & RTL Excellence:** Maintain pixel-perfect RTL alignment, Vazirmatn typography, and mobile drawer ergonomics.

### Non-Goals
- Changing backend contracts, database models, or core cryptographic logic (`@karvan/contracts`, `@karvan/core`).
- Altering authenticated API routes or server-side business logic.

### Anti-Goals
- Cluttered, generic agricultural green templates with generic stock illustrations.
- Broken links, non-functional fake buttons, or dummy `href="#"`.
- Latin/Persian text misalignments or bidirectional punctuation bleeding.

---

## 3. Constraints

- **Monorepo Structure:** npm workspaces (`@karvan/contracts`, `@karvan/core`, `@karvan/i18n`, `@karvan/ui`, `@karvan/web`).
- **Next.js 16 + React 19 + Tailwind CSS v4:** Ensure all CSS tokens and utilities align with Tailwind v4 `@theme` syntax and logical properties.
- **Farsi-First RTL:** Full native RTL flow with `<bdi dir="ltr">` isolation for HS codes, ISO standards, and English port identifiers (BIK, AMR).
- **Test Integrity:** All parity and integration test suites in Vitest must continue to pass 100%.

---

## 4. Approaches Considered

1. **Material 3 Dynamic Industrial (Selected Approach - Hybrid):**
   - Synthesizes the Material 3 Dynamic tokens, live terminal ticker, and rich assay cards with the instant-filtering Omnibox search.
   - Balances institutional credibility with rapid B2B procurement ergonomics.
2. **Pure M3 Dynamic Implementation:**
   - Strict adherence to `material_3_dynamic/code.html` without Omnibox search integration.
3. **Pure Google Omnibox Store:**
   - Minimal white store interface with central search bar, but lacks the specialized maritime and port logistics metadata.

**Decision:** The user selected the **Hybrid Material 3 Dynamic + Omnibox Search** approach.

---

## 5. Architectural & Component Specifications

### 5.1 Color Tokens
```css
/* Core M3 Brand Tokens */
--color-m3-primary: #1B4332;
--color-m3-primary-hover: #143527;
--color-m3-primary-container: #d8f3e5;
--color-m3-on-primary: #ffffff;
--color-m3-on-primary-container: #052e16;

--color-m3-secondary: #2D6A4F;
--color-m3-secondary-container: #e1efe6;
--color-m3-on-secondary-container: #0f3928;

--color-m3-tertiary: #C99A3A;
--color-m3-tertiary-container: #fef3c7;
--color-m3-on-tertiary: #ffffff;
--color-m3-on-tertiary-container: #78350f;

/* Surfaces & Containers */
--color-m3-surface: #f8faf8;
--color-m3-surface-dim: #eff3f0;
--color-m3-surface-container: #f1f5f2;
--color-m3-surface-container-high: #e9efeb;
--color-m3-surface-container-highest: #e1e8e4;
--color-m3-surface-lowest: #ffffff;

/* Outlines & Text */
--color-m3-outline: #747975;
--color-m3-outline-variant: #c3c8c3;
--color-m3-on-surface: #191c1a;
--color-m3-on-surface-variant: #404943;
```

### 5.2 Header & Navigation
- **Live Market Ticker:** Fixed top bar with real-time port telemetry (Bandar Imam berth 34, Amirabad silos, SGS verification, GAFTA standard).
- **Sticky App Bar:** Glassmorphic header with M3 brand mark, rounded pill navigation links, tracking shortcut button, and primary RFQ trigger.
- **Mobile Navigation Drawer:** Responsive slide-out drawer with quick action chips and touch targets >= 44px.

### 5.3 Hero Section & Interactive Hub
- **Ambient Glow:** Soft gradient ambient light fields (`bg-m3-primary-container/40 blur-3xl`).
- **Interactive Multi-Pill Hub:**
  - Commodity selector (ذرت زرد برزیل، کنجاله سویا، جو دامی، دی‌کلسیم فسفات).
  - Port & Terminal selector (بندر امام، بندر امیرآباد، انبار مرکزی).
  - Tonnage input with metric units.
  - Quick action search & quote button with instant feedback.
- **Google Omnibox:** Instant live search filtering products by keyword and HS code.

### 5.4 Commodity Cards & Catalog
- **Cards (M3 Cards):** 24px corner radius (`rounded-3xl`), pure white surface, M3-1 elevation with smooth hover elevation (`shadow-m3-3`).
- **Assay Badges:** Dedicated 3-column micro-grid displaying laboratory assay parameters (Protein %, Moisture %, Aflatoxin ppb, Urease activity).
- **Logistics Indicators:** Origin, loading berth, and minimum order quantity (MOQ) highlighted in Grain Amber (`#C99A3A`).

### 5.5 Pages Upgraded
1. **Homepage (`/`):** Full M3 Hero, interactive hub, metrics strip, featured feed commodities, value pillars, and quick RFQ sheet.
2. **Products Catalog (`/products`):** Interactive Omnibox search, category chips, grid/table toggle, and M3 commodity cards.
3. **Product Detail (`/products/[id]`):** Laboratory assay ledger table, port logistics metadata, and instant quotation trigger.
4. **RFQ Form (`/rfq`):** Official B2B proforma intake sheet with honeypot and real API submission.
5. **Tracking (`/track`):** Shipment & customs tracking timeline with port milestones.
6. **Quality & FAQ (`/quality`):** Chemical parameters, SGS standards, SHA-256 integrity, and interactive FAQ accordion.
7. **About, Services, Markets, Contact, Terms, Privacy:** Aligned with M3 colors, pill chips, and clear typographic hierarchy.

---

## 6. What's Left to the Builder

1. Update tokens in `packages/ui/src/styles/tokens.css` and `base.css` to incorporate the M3 Dynamic color tokens and shadows.
2. Refactor components in `packages/ui` (`Button`, `IncotermChip`, `KpiTile`, `PageHeader`, `Notice`, `LedgerTable`).
3. Update `apps/web/src/components/navbar.tsx` and `ticker.tsx` to include the live port ticker and M3 navigation.
4. Rebuild `apps/web/src/app/[locale]/(site)/page.tsx` with the Hero interactive search hub and M3 sections.
5. Verify catalog browser in `apps/web/src/app/[locale]/(site)/products/catalog-browser.tsx`.
6. Run full verification (Vitest tests, Next.js build, and live browser check).
