# Stitch AgriTrade B2B Platform UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the entire frontend design system and site pages of «دنیای هوشمند آینده» to adopt the Material 3 Dynamic + Omnibox Search architecture from the Stitch UI package (`stitch_agri_trade_b2b_platform_ui.zip`).

**Architecture:** Integrate the M3 Dynamic color tokens, elevation models, and typography in `@karvan/ui/tokens.css` and `globals.css`. Build the live port logistics ticker bar and sticky app bar in `apps/web/src/components/navbar.tsx` and `ticker.tsx`. Redesign the homepage Hero with the Google Flights-inspired multi-pill search & quote hub, update the product catalog with instant Omnibox filtering and 24px M3 commodity cards with lab assay badges, and propagate the design language across all remaining routes.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Motion (Framer Motion), Vitest, TypeScript.

**Spec:** `docs/superpowers/specs/2026-10-26-stitch-design-system-design.md`

## Global Constraints

- Monorepo structure: npm workspaces (`@karvan/contracts`, `@karvan/core`, `@karvan/i18n`, `@karvan/ui`, `@karvan/web`).
- No modifications to business logic, API validation rules, or core cryptographic logic.
- Strict RTL precedence with `<bdi dir="ltr">` isolation for HS codes, ISO standards, and English port identifiers (BIK, AMR).
- All unit, parity, and integration test suites in Vitest must continue to pass 100%.
- Accessibility: interactive touch targets >= 44px, contrast ratio >= 4.5:1 (WCAG AA).

## Review Focus

1. **Port Logistics Ticker Overflow:** Ensure ticker items scroll smoothly without line-breaks or horizontal page overflow on small viewports (390px).
2. **Interactive Hub Form State:** Selecting a commodity or port in the Hero hub must cleanly synchronize with URL parameters or state when navigating to the RFQ form.
3. **Omnibox Search Debounce & Clear:** Instant search in the catalog must filter both English/numeric HS codes and Persian commodity names without lag.
4. **Assay Card Grid Alignment:** The 3-column assay grid on commodity cards must not clip text or overflow on mobile devices.
5. **Color Token Parity:** Dark mode overrides in `[data-theme="dark"]` must map seamlessly to M3 dark surface container values.

---

### Task 1: Design Tokens & Base Theme Integration

**Files:**
- Modify: `packages/ui/src/styles/tokens.css`
- Modify: `packages/ui/src/styles/base.css`
- Modify: `apps/web/src/app/[locale]/globals.css`
- Test: `packages/i18n/test/parity.test.ts`

**Interfaces:**
- Consumes: Tailwind CSS v4 `@theme` block.
- Produces: CSS custom properties (`--color-m3-primary`, `--color-m3-surface-container`, `--shadow-m3-search`, etc.).

- [ ] **Step 1: Write test verifying token integration**
Ensure Vitest parity tests continue to run and verify theme tokens compile cleanly with `npm test`.

- [ ] **Step 2: Add M3 Dynamic tokens to `packages/ui/src/styles/tokens.css`**
Add the core M3 tokens:
- `--color-m3-primary: #1B4332;`
- `--color-m3-primary-hover: #143527;`
- `--color-m3-primary-container: #D8F3E5;`
- `--color-m3-on-primary-container: #052E16;`
- `--color-m3-secondary: #2D6A4F;`
- `--color-m3-secondary-container: #E1EFE6;`
- `--color-m3-tertiary: #C99A3A;`
- `--color-m3-tertiary-container: #FEF3C7;`
- `--color-m3-surface: #F8FAF8;`
- `--color-m3-surface-container: #F1F5F2;`
- `--color-m3-surface-container-high: #E9EFEB;`
- `--color-m3-surface-lowest: #FFFFFF;`
- Shadows: `--shadow-m3-1`, `--shadow-m3-2`, `--shadow-m3-3`, `--shadow-m3-search: 0 4px 20px rgba(27, 67, 50, 0.08);`.

- [ ] **Step 3: Update `base.css` and `globals.css`**
Add M3 smooth scrollbar styling, button press states (`.m3-press-state`), and container border radii.

- [ ] **Step 4: Run test to verify build**
Run: `npm --workspace=@karvan/ui test` or `npm test`
Expected: PASS

---

### Task 2: Live Market Ticker & Sticky App Bar Navigation

**Files:**
- Modify: `apps/web/src/components/ticker.tsx`
- Modify: `apps/web/src/components/navbar.tsx`
- Modify: `apps/web/src/components/mobile-nav.tsx`
- Test: `apps/web/tests/feed-catalog.test.ts`

**Interfaces:**
- Consumes: M3 color tokens and locale dictionary.
- Produces: Updated `<Navbar />` and `<Ticker />` components.

- [ ] **Step 1: Update `ticker.tsx` with Live Port Telemetry**
Include live terminal status:
- `پایش زنده پایانه‌ها:`
- `ذرت زرد برزیلی فله FOB بندرامام (اسکله ۳۴)`
- `کنجاله سویا پلیت 44% CP تحویل سیلو`
- `جو دامی قزاقستان بندر امیرآباد (سیلوهای مکانیزه)`
- `دی‌کلسیم فسفات (DCP 18%) کیسه ۵۰ کیلویی`
- `SGS Verified • ISO 9001:2015 • استاندارد GAFTA`

- [ ] **Step 2: Update `navbar.tsx` with M3 App Bar Styling**
Add top ticker bar above navbar.
Update brand logo to rounded 12px container with grain icon.
Add navigation chips with rounded-full hover states.
Add tracking shortcut pill and prominent `ثبت رسمی RFQ` primary button.

- [ ] **Step 3: Update `mobile-nav.tsx` Drawer**
Align mobile drawer with M3 surface containers, quick action buttons, and touch targets >= 44px.

- [ ] **Step 4: Verify navigation**
Run: `npm test`
Expected: PASS

---

### Task 3: Homepage Hero with Multi-Pill Interactive Search Hub

**Files:**
- Modify: `apps/web/src/app/[locale]/(site)/page.tsx`
- Test: `apps/web/tests/rfq-workflow.test.ts`

**Interfaces:**
- Consumes: Seed commodities and M3 components.
- Produces: Re-engineered B2B Homepage Hero.

- [ ] **Step 1: Implement ambient glow and typography**
Add soft dynamic glow blobs (`bg-m3-primary-container/40 blur-3xl`).
Update hero title: `تأمین بی‌واسطه نهاده‌های دامی با آنالیز آزمایشگاهی معتبر`.

- [ ] **Step 2: Build Google Flights-style Interactive Search Hub**
Create the multi-pill hub:
- Commodity selector dropdown (ذرت زرد، کنجاله سویا، جو دامی، دی‌کلسیم فسفات).
- Terminal & Port selector (بندر امام خمینی BIK، بندر امیرآباد AMR، انبار مرکزی).
- Volume / Tonnage input with metric units.
- Instant Search & Quote CTA (`استعلام فوری`) linking directly to `/rfq` with pre-filled query params.
- Fast status assurance strip: `صدور آنی پیش‌فاکتور رسمی در کمتر از ۲ ساعت • تأییدیه سامانه بازارگاه`.

- [ ] **Step 3: Add Google-style Trust Micro-Badges & Metric Cards Strip**
Add 4 analytics-style metric cards:
- ۱۵+ سال سابقه تخصصی غلات
- ۴۸۰,۰۰۰+ تن نهاده توزیع‌شده در سال
- ۲ پایانه اختصاصی بندرامام و امیرآباد
- ۱۰۰٪ تطابق با استانداردهای ملی و بین‌المللی

- [ ] **Step 4: Add Value Pillars Section & Quick RFQ Sheet**
Include the 3 value pillars: SGS purity guarantee, rapid port discharge, official proforma invoicing.

---

### Task 4: Product Catalog & Omnibox Live Search

**Files:**
- Modify: `apps/web/src/app/[locale]/(site)/products/catalog-browser.tsx`
- Modify: `apps/web/src/app/[locale]/(site)/products/page.tsx`
- Modify: `apps/web/src/app/[locale]/(site)/products/[id]/page.tsx`
- Test: `apps/web/tests/feed-catalog.test.ts`

**Interfaces:**
- Consumes: Product seeds and Omnibox search state.
- Produces: Modernized Catalog Browser and Detail views.

- [ ] **Step 1: Implement Google Omnibox search in `catalog-browser.tsx`**
Create the Google Omnibox pill search input with search icon, clear button, and quick suggestion chips (ذرت برزیل ۵۰۰ تن، کنجاله پروتئین ۴۴٪، جو دامی خزر، فسفات دامی DCP).

- [ ] **Step 2: Redesign Commodity Cards to M3 24px Cards**
Update cards to `rounded-3xl` with pure white background, subtle border, and `shadow-m3-1`.
Add port tags (`آماده بارگیری`, `بندر امیرآباد`, `تحویل انبار`).
Add 3-column micro-grid for chemical & physical assay parameters (Protein, Moisture, Aflatoxin / KOH / Fiber).
Highlight minimum order quantity (MOQ) and add direct `استعلام قیمت روز` action button.

- [ ] **Step 3: Update Product Detail Page (`[id]/page.tsx`)**
Refactor the specification tables, port logistics notes, and technical analysis sheet with M3 tokens.

- [ ] **Step 4: Run catalog tests**
Run: `npm test`
Expected: PASS

---

### Task 5: B2B RFQ Form & Shipment Tracking Experience

**Files:**
- Modify: `apps/web/src/app/[locale]/(site)/rfq/rfq-form.tsx`
- Modify: `apps/web/src/app/[locale]/(site)/track/track-view.tsx`
- Test: `apps/web/tests/rfq-workflow.test.ts`

**Interfaces:**
- Consumes: Contracts schemas (`CreateRfqSchema`, `TrackQuerySchema`).
- Produces: Enhanced RFQ Form and Tracking Timeline.

- [ ] **Step 1: Update `rfq-form.tsx` with M3 Sheet Styling**
Format form controls with 4px border-radius, clean labels, required indicators, and SLA assurance badges (`صدور پیش‌فاکتور رسمی در کمتر از ۲ ساعت`).

- [ ] **Step 2: Update `track-view.tsx` with Material Timeline**
Modernize status badges, milestone steps, and tracking code lookups.

- [ ] **Step 3: Test RFQ submission and tracking workflow**
Run: `npx vitest run apps/web/tests/rfq-workflow.test.ts`
Expected: PASS

---

### Task 6: Supporting Pages, Footer & Design System Uniformity

**Files:**
- Modify: `apps/web/src/app/[locale]/(site)/quality/page.tsx`
- Modify: `apps/web/src/app/[locale]/(site)/about/page.tsx`
- Modify: `apps/web/src/app/[locale]/(site)/services/page.tsx`
- Modify: `apps/web/src/app/[locale]/(site)/markets/page.tsx`
- Modify: `apps/web/src/app/[locale]/(site)/contact/page.tsx`
- Modify: `apps/web/src/components/footer.tsx`
- Test: `packages/i18n/test/parity.test.ts`

**Interfaces:**
- Consumes: M3 design tokens.
- Produces: Cohesive styling across all site routes and footer.

- [ ] **Step 1: Update Quality & FAQ Page (`quality/page.tsx`)**
Style assay parameter cards and scientific FAQ accordion using M3 container styles.

- [ ] **Step 2: Update About, Services, Markets, and Contact Pages**
Ensure all port hub terminals, logistics cards, maritime corridors, and contact office cards use M3 cards and typography.

- [ ] **Step 3: Update Footer (`footer.tsx`)**
Incorporate M3 surface container styling, official company registration codes (شماره ثبت و شناسه ملی), quick port links, and official contact numbers.

---

### Task 7: Full System Verification, Visual QA, and Test Coverage

**Files:**
- Verify: Full codebase
- Script: `capture_screenshots.sh`

- [ ] **Step 1: Run complete test suite**
Run: `npm test`
Expected: All tests pass (0 failures).

- [ ] **Step 2: Run production Next.js build**
Run: `npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 3: Run live screenshot capture**
Run: `bash capture_screenshots.sh`
Expected: All 20 desktop and mobile screenshots captured.
