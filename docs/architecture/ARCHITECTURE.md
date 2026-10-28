# ARCHITECTURE — Karvan Platform

Modular monolith: one fullstack Next.js app, domain logic isolated in pure packages. TypeScript end to end.

## 1. Package graph

```
packages/core        @karvan/core        pure TS domain, ZERO runtime deps
packages/contracts   @karvan/contracts   zod v4 schemas + API envelope helpers (deps: zod)
packages/i18n        @karvan/i18n        fa/en dictionaries, formatting helpers (no deps)
packages/ui          @karvan/ui          design system: tokens.css + React components (deps: react, clsx, tailwind-merge, lucide-react)
apps/web             @karvan/web         Next.js 16 fullstack app (deps: all packages + next-intl, motion, recharts)
```

`core` must never import from other packages. `contracts` imports only zod. `ui` never imports `core`/`contracts` (it receives values as props). Packages are consumed as TS source (`"main": "./src/index.ts"`) with `transpilePackages` in next.config — no build step per package.

## 2. Domain model (packages/core)

### 2.1 Money — `money.ts`
BigInt scaled-integer arithmetic. No IEEE-754 for money anywhere in the platform.
- `Money.from(amount, currency)`, `Money.fromMinorUnits`, `Money.zero`, `Money.sum`, `Money.min/max`.
- Instance: `add, sub, mul (exact), div (HALF_EVEN default), round, abs, negate, isZero/isPositive/isNegative, compare ops, toMinorUnits, toDecimalString, format`.
- Currency decimals: 2 for USD/EUR/GBP/AED/CNY/CHF/TRY/SAR; 3 for OMR/KWD/BHD/JOD; 0 for IRR/JPY/KRW/VND.
- Errors: `CurrencyMismatchError (code: 'currency_mismatch')`.

### 2.2 RFQ state machine — `rfq-status.ts` (11 states)
`draft, submitted, under_review, needs_information, qualified, quote_preparation, quoted, accepted, rejected, expired, cancelled`

| from | to (action) |
|---|---|
| draft | submitted (SUBMIT_RFQ) |
| submitted | under_review (ASSIGN_LEAD) · rejected (REJECT_LEAD, reason required) · cancelled |
| under_review | needs_information (REQUEST_INFO, question ≥ 20 chars) · qualified (QUALIFY_RFQ) · rejected (reason) · cancelled |
| needs_information | under_review (PROVIDE_INFO) · expired (SLA 24h) · cancelled |
| qualified | quote_preparation (START_PRICING) · rejected · cancelled |
| quote_preparation | quoted (DISPATCH_QUOTE) · rejected · cancelled |
| quoted | accepted (ACCEPT_DEAL) · quote_preparation (REQUEST_REVISION) · rejected · expired · cancelled |

Guards enforced in code: `assertRfqTransition(from, to)` throws `InvalidRfqTransitionError {code:'invalid_rfq_transition', from, to, allowed}`. Data-level guards (reason required) are enforced by store + contracts.

### 2.3 Quote state machine — `quote-status.ts` (8 states)
`draft, internal_review, approved, sent, revised, accepted, declined, expired`

| from | to (action) |
|---|---|
| draft | internal_review (SUBMIT_FOR_APPROVAL) · approved (AUTO_APPROVE when below thresholds) · sent (DIRECT_DISPATCH) |
| internal_review | approved (APPROVE_QUOTE) · draft (RETURN_FOR_EDITS, reason ≥ 10 chars) · declined (DECLINE_INTERNALLY) |
| approved | sent (DISPATCH_QUOTE — freeze snapshot) |
| sent | accepted (ACCEPT_QUOTE) · revised (REVISE_QUOTE — spawns v(n+1) draft, this record is archived) · declined · expired (validUntil sweep) |

`revised` is not terminal: it marks the record superseded by `version + 1`.

### 2.4 Shipment milestones — `shipment.ts` (9, strictly ordered, forward-only)
`booking_confirmed → cargo_received_at_port → customs_cleared_export → vessel_loaded → vessel_departed → in_transit → arrived_destination_port → customs_cleared_import → delivered`
`assertMilestoneAdvance(current, target)` allows target index > current index (may skip forward), never backwards or equal.

### 2.5 Trade case status — `trade-case.ts`
`confirmed → in_execution → completed`; `cancelled` allowed from `confirmed`/`in_execution` with reason. Enforcement: `assertTradeCaseTransition`.

### 2.6 Quote calculator — `quote-calculator.ts`
- Line total: `gross = unitPrice × quantity`; discount pct → `gross − gross×pct/100` (rounded HALF_EVEN to currency decimals).
- Totals: subtotal (sum of lines) + shipping + insurance + tax − discount; clamp ≥ 0.
- **Approval gate**: `requiresManagementApproval(discountPct, total)` = true when `discountPct > 10` OR `total > 50,000 USD` (strictly greater).
- **Immutable snapshot**: `createQuoteSnapshot(input)` → `{...input, snapshotVersion: 1, createdAt, checksum}`; `verifyQuoteSnapshot(snapshot)` recomputes SHA-256 over canonical JSON (sorted keys). SHA-256 must be a hand-written pure-TS FIPS 180-4 implementation (no node:crypto) so it runs on edge and client.

### 2.7 Permissions — `permissions.ts`
Roles: `visitor, buyer, sales_rep, trade_manager, procurement, logistics, finance, admin`.
`AuthUser {id, role, organizationId, isActive}`. Guards (all throw `ForbiddenDomainActionError {code:'forbidden_domain_action'}`):
- `canAccessRfq`: buyer → tenant match only; sales_rep → assigned or unassigned non-draft; trade_manager/admin → all; procurement/logistics/finance → non-draft read-only.
- `canAccessQuote`: buyer → tenant match AND status ∉ {draft, internal_review}; sales_rep+ → yes.
- `canCreateQuote`: sales_rep, trade_manager, admin. `canDispatchQuote`: creator/assignee sales_rep or trade_manager/admin, status ∈ {approved, draft-when-auto-approve}.
- `canApproveQuote`: trade_manager/finance/admin, **never the quote's creator** (four-eyes); admin exempt.
- `canAcceptQuote` / `canDeclineQuote`: buyer of `buyerOrganizationId`, status = sent; admin with status = sent.

### 2.8 Audit — `audit.ts`
17 event types (`rfq.created/submitted/assigned/qualified/rejected/status_changed`, `quote.created/approved/sent/accepted/revised/declined/expired`, `trade_case.created/milestone_updated/completed`, `document.downloaded`, `inquiry.received`, `permission.changed`).
`buildRedactedAuditRecord(input)`: deep-redacts 18 sensitive key patterns → `[REDACTED]`, scrubs Bearer/JWT strings, computes SHA-256 integrity checksum. `verifyAuditEventIntegrity(event)`.

## 3. Session & authorization (apps/web)

No real auth (demo platform), but authorization is **server-enforced, never cosmetic**:
- Cookie `kv_session` = base64url(JSON `{userId, role, organizationId, name}`) + `.` + HMAC-SHA256 signature with `SESSION_SECRET` (env, dev fallback). Created via server actions.
- `getSession()` server helper verifies signature; `requireRole(...)` / `requireTenant()` redirect on failure.
- All store mutations take an explicit `ActorContext {userId, role, organizationId}` resolved **server-side from the session** — API routes never accept `actorRole` from request bodies.
- CRM default session: `sales_rep` of `org_karvan`. Portal default: `buyer` of a seeded tenant. A «حالت نمایش» (view-as) switcher in headers sets the cookie via a server action — an honest demo affordance.

## 4. Data store (apps/web/src/lib/store.ts)

In-memory singleton on `globalThis` (demonstration persistence). Multi-tenant by `organizationId`. Entities: `Organization, User, Product, RfqRecord, QuoteRecord, TradeCaseRecord, TradeDocument, Notification, ContactInquiry, AuditEvent`.

Rules that fix known past failures:
- `createQuote` supports **multiple quotes per RFQ** (buyer can compare).
- `requestRevision` **spawns v(n+1) draft** with revision notes attached; the sent record moves to `revised`.
- `transitionRfq` / quote transitions take `expectedVersion` → 409 `version_conflict` on mismatch (optimistic concurrency).
- `runSweep()` (called on store access): expires RFQs past SLA and quotes past `validUntil`.
- Idempotency: store keeps `Map<idempotencyKey, {status, body}>` for all mutating operations; replays the stored response on duplicate keys.
- Quote numbers sequential from a counter (`Q-1405-0001`), never random.
- Tenant isolation: portal queries always filter by session tenant; CRM queries by role guard.

### Seed data (coherent, fictional, plausible)
- Seller: `org_karvan` (کاروان، تهران). Buyer tenants: `org_arya_polymer` (آریا پلیمر خلیج فارس، AE), `org_bavaria_metall` (Bayerisch Metallhandel GmbH، DE), `org_sinar_agro` (PT Sinar Agro Nusantara، ID), `org_istanbul_bakir` (İstanbul Bakır Sanayi A.Ş.، TR), `org_gulf_amber` (Gulf Amber Chemicals LLC، AE).
- 9 products (Iranian export basket): HDPE film grade, urea 46%, copper cathode, saffron negin, pistachio (ahmad aghaei), bitumen 60/70, granular sulfur, aluminum ingot A7, methanol — each with HS code, MOQ, unit, price indication, lead time, specs, packaging.
- 8 RFQs across all active statuses (versions, SLA deadlines, assignments consistent), ≥2 quotes on one RFQ (comparison scenario), 4 trade cases at different milestones (one air shipment with AWB), 8 documents, seed notifications, 8 audit events consistent with the above. **Dates: fixed ISO strings in 2025–2026; do not use relative dates at module load.**

## 5. API surface (apps/web, `/api/v1`)

Envelope: `{success: true, data, requestId?, timestamp?}` / `{success: false, error: {code, message, details?, requestId?}}` — helpers from `@karvan/contracts`. All mutating POSTs require `Idempotency-Key` header (16–128 chars).

| Endpoint | Method | Notes |
|---|---|---|
| `/api/v1/rfqs` | GET, POST | POST = public intake, honeypot + consent + Zod; GET = CRM list (role-guarded) |
| `/api/v1/rfqs/[id]/transition` | POST | guard: `assertRfqTransition` + permission + expectedVersion |
| `/api/v1/quotes` | GET, POST | POST = draft from RFQ (sales roles); GET filtered by session |
| `/api/v1/quotes/[id]/approve` | POST | four-eyes enforced |
| `/api/v1/quotes/[id]/finalize` | POST | approval gate + snapshot freeze |
| `/api/v1/quotes/[id]/accept` | POST | buyer, snapshot verify + validity check → creates trade case |
| `/api/v1/quotes/[id]/revise` | POST | spawns v(n+1) draft |
| `/api/v1/quotes/[id]/decline` | POST | reason enum |
| `/api/v1/cases/[id]/milestone` | POST | forward-only advance |
| `/api/v1/cases/[id]/checklist` | POST | toggle item |
| `/api/v1/inquiries` | POST | contact form intake |
| `/api/v1/track` | GET | public tracking by reference (+ optional email match) |
| `/api/v1/notifications` | GET, POST | list / mark-read (session-scoped) |

## 6. Routing (apps/web)

next-intl 4, `routing.ts` with `locales: ['fa','en']`, `defaultLocale: 'fa'`, `localePrefix: 'as-needed'` (fa at `/`, en at `/en`). `proxy.ts` (Next 16 middleware) wires it and sets `x-locale`. All pages under `app/[locale]/`:

- Public: `/` · `/about` · `/about/export-history` · `/services` · `/services/[slug]` · `/products` · `/products/[id]` · `/markets` · `/quality` · `/contact` · `/rfq` (4-step wizard) · `/track` · `/terms` · `/privacy`
- CRM: `/crm` (inbox) · `/crm/rfqs/[id]` · `/crm/rfqs/[id]/quote` (quote engine) · `/crm/cases` · `/crm/cases/[id]` (cockpit) · `/crm/analytics` · `/crm/audit`
- Portal: `/portal` · `/portal/rfqs` · `/portal/rfqs/[id]` · `/portal/rfqs/[id]/quotes` (comparison) · `/portal/quotes/[id]` · `/portal/orders` · `/portal/orders/[id]` · `/portal/documents`
- `sitemap.ts` covers every public route in both locales; `robots.ts` disallows `/api/`, `/crm/`, `/portal/`, `/en/crm`, `/en/portal`.

## 7. Quality gates

- `npm test` — Vitest 5, root config with per-package projects. Required suites: money precision, RFQ matrix (100% of legal transitions + illegal rejections), quote matrix, milestone ordering, permissions matrix, audit redaction, snapshot integrity, idempotency replay, version conflict.
- `npm run typecheck` — all workspaces.
- No page or route ships with a placeholder, dead link, or unimplemented handler.
