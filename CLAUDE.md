# CLAUDE.md — ISO Audit Manager

## Package Manager

- use bun as package manager (not npm/yarn/pnpm)

## Build & Validate

- `make check` — full validation (format + typecheck + lint + test)
- `make check-no-test` — validation without tests (for IFACE/TEST phases)
- `make format` — auto-fix formatting
- `make build` — production build
- `make dev` — start dev server

## Tech Stack

- SvelteKit 2 + Svelte 5 (runes: $state, $derived, $effect, $props)
- Tailwind CSS 4 via @tailwindcss/vite plugin
- Bits UI / ShadCN-svelte components in src/lib/components/ui/
- Drizzle ORM + Turso (LibSQL) — schema in src/db/schema.ts
- better-auth (Google OAuth + email/password) — config in src/lib/auth.ts
- Remote functions enabled (svelte.config.js experimental.remoteFunctions)
- Vitest + @testing-library/svelte for tests

## Project Structure

- src/routes/(app)/ — authenticated app routes (12 pages)
- src/routes/(auth)/ — login/auth routes
- src/lib/components/ui/ — ShadCN base components
- src/lib/components/ — app-specific components
- src/lib/types/ — TypeScript interfaces
- src/lib/rpc/ — remote function files (\*.remote.ts)
- src/lib/server/ — server-only code (db.ts)
- src/db/schema.ts — Drizzle schema
- specs/ — feature specifications (German)
- static/ — static assets

## Svelte 5 Patterns

- Props: `let { data } = $props()`
- State: `let count = $state(0)`
- Derived: `let doubled = $derived(count * 2)`
- Children: `{@render children()}` (not `<slot/>`)
- Events: use callback props, not createEventDispatcher

## Conventions

- Formatting: Prettier with tabs, single quotes, no trailing commas (see .prettierrc)
- Linting: ESLint flat config with typescript-eslint + eslint-plugin-svelte
- German UI labels, German spec files
- Component files: PascalCase.svelte
- Route files: kebab-case directories
- Server functions in .remote.ts use query() and mutation() from $app/server

## Learnings

(Ralph adds discovered patterns and gotchas here)
