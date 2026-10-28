# ENGINEERING — conventions and stack (Karvan Platform)

## Stack (pinned — do not upgrade or downgrade without updating this file)

| Package | Version | Notes |
|---|---|---|
| next | 16.4.3 | Turbopack default; `proxy.ts` instead of middleware; `transpilePackages` for workspace TS |
| react / react-dom | 19.3.1 | |
| typescript | 6.0.3 | JS-based line (TS 7 has no compiler API yet) |
| tailwindcss + @tailwindcss/postcss | 4.3.3 | CSS-first `@theme`; logical properties; `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))` |
| zod | 4.6.7 | contracts package only; top-level `z.email()` etc. |
| vitest + @vitest/coverage-v8 | 5.0.5 | root config, `test.projects`; needs Node ≥ 22.12 |
| next-intl | 4.14.9 | `defineRouting`, `createNavigation`, `proxy.ts` |
| motion | 14.6.0 | import from `motion/react`, client components only |
| lucide-react | 1.61.0 | |
| recharts | 3.10.1 | wrap in `dir="ltr"` container; mirror page chrome manually |
| clsx / tailwind-merge | latest 2.x / 3.x | `cn()` lives in `@karvan/ui` |
| @fontsource-variable/vazirmatn | 5.3.0 | self-hosted; Google Fonts banned at runtime |
| @fontsource/lalezar, @fontsource/ibm-plex-mono | 5.x | |

Node ≥ 24 (LTS). npm workspaces (no pnpm/turbo). One root lockfile.

## Commands

```bash
npm install          # once, at repo root
npm run dev          # apps/web on http://localhost:3100
npm test             # vitest run (all projects)
npm run typecheck    # all workspaces
npm run build        # next build
```

## Code conventions

- TypeScript strict everywhere; `type` imports where possible; no `any` without a written justification comment.
- File names: kebab-case; components PascalCase exports from kebab-case files.
- Server components by default; `"use client"` only where interactivity requires it.
- All validation through `@karvan/contracts`; all money through `@karvan/core` Money; all state changes through state-machine asserts. A direct status assignment is a review failure.
- Persian strings live in `@karvan/i18n` dictionaries (both locales, structurally identical); pages never hardcode user-facing Persian outside the dictionaries (design-system internal labels excepted).
- Comments: only where the code cannot speak (invariants, domain rules, workarounds). No narrative comments, no changelog comments, no author names.
- Icons: lucide only; directional icons swap via `dir` (use CSS `rtl:` variants or a small `DirIcon` helper).
- Dates stored ISO; formatted via `@karvan/i18n` helpers (Jalali for fa).

## Integrity rules (hard requirements)

1. Never fabricate evidence: seed content that is illustrative must be labeled as such (نمونهٔ پرونده / sample record). No invented certifications claimed as live facts.
2. Money never in floats. Status never mutated outside its machine. Snapshot never edited after `sent`.
3. Server-side authorization on every read and write; portal data filtered by session tenant.
4. Idempotency-Key on every mutating endpoint; replays return the original response.
5. Optimistic concurrency: mutating transitions accept `expectedVersion`; mismatch → 409.

## No-AI-trace checklist (every file must pass)

- No emoji anywhere (code, UI, comments, docs).
- No words like: AI, LLM, GPT, Claude, ChatGPT, Copilot, prompt, generated, scaffold, boilerplate, lorem, ipsum, TODO, FIXME, XXX, placeholder (as a word), sample text, "as an AI".
- No `.claude/`, `AGENTS.md`, `CLAUDE.md`, `kit/` folders, no agent/skill references.
- No decorative emoji bullets in README or docs; no marketing fluff in code comments.
- No default-library look: no default Tailwind palette hexes in components (tokens only), no radius > 2px, no gradients, no glass, no purple/indigo.
- Persian copy passes the نیم‌فاصله rule (see BRAND.md) and reads like a human trade professional wrote it.
- Variable names are domain-natural (`quoteNumber`, `bookingConfirmed`), never generic filler (`data1`, `temp`, `utils2`).
- Every interactive element has a real handler; every page has real content; no dead links.

## Windows notes (CI parity)

- `.gitattributes`: `* text=auto eol=lf`. `.editorconfig` enforces LF + UTF-8.
- Never rely on shell-specific syntax in npm scripts (no `VAR=x cmd`, no globs) — scripts run under cmd.exe.
- Keep imports case-consistent with the filesystem exactly (`forceConsistentCasingInFileNames` is on via TS 6 defaults).
