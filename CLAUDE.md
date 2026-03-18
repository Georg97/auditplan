# CLAUDE.md — ISO Audit Manager

## Package Manager

- use bun as package manager (not npm/yarn/pnpm)

## Build & Validate

- `make check` — full validation (format + typecheck + lint + test)
- `make check-no-test` — validation without tests (for IFACE/TEST phases)
- `make format` — auto-fix formatting
- `make build` — production build
- `make dev` — start dev server
- `make db-push` — push Drizzle schema changes to Turso (run after modifying src/db/schema.ts)

## Tech Stack

- SvelteKit 2 + Svelte 5 (runes: $state, $derived, $effect, $props)
- Tailwind CSS 4 via @tailwindcss/vite plugin
- Bits UI / ShadCN-svelte components in src/lib/components/ui/
- Drizzle ORM + Turso (LibSQL) — schema in src/db/schema.ts
- better-auth (Google OAuth + email/password) — config in src/lib/auth.ts
- Remote functions enabled (svelte.config.js experimental.remoteFunctions)
- SvelteKit SuperForms + Zod 4 for all form handling
- TanStack Table (@tanstack/svelte-table) for all data tables
- i18next + custom i18nRune for internationalization (10 languages, lazy-loaded)
- Vitest for logic-first testing (NO component render tests)
- Playwright MCP for E2E browser verification (isolated Chromium, not user's browser)

## Project Structure

- src/routes/(app)/ — authenticated app routes (12 pages)
- src/routes/(auth)/ — login/auth routes
- src/lib/components/ui/ — ShadCN base components (installed via CLI, do NOT hand-write)
- src/lib/components/ — app-specific components
- src/lib/types/ — TypeScript interfaces + Zod schemas
- src/lib/rpc/ — remote function files (\*.remote.ts)
- src/lib/server/ — server-only code (db.ts)
- src/lib/state/ — shared rune-based state classes (settings, i18n)
- src/lib/i18n/ — i18nRune implementation
- src/lib/data/ — static knowledge database (TS files)
- src/lib/word/ — Word document generation helpers
- src/db/schema.ts — Drizzle schema
- specs/ — feature specifications (German)
- static/ — static assets (logos, favicons)
- static/locales/ — i18n JSON files ({lang}.json)

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

## Architecture Rules (MANDATORY)

### Data Layer

- **NEVER use localStorage** for data persistence. All data goes through Drizzle ORM + Turso.
- Data reads: `query()` from `$app/server` in `.remote.ts` files
- Data writes: `mutation()` from `$app/server` in `.remote.ts` files
- Only exception for localStorage: transient client-side UI state (e.g. sidebar collapsed)

### Remote Functions vs Form Actions

- Use `.remote.ts` (query/mutation) for: fetching data for display, shared data operations called from multiple pages, bulk operations (batch delete, export)
- Use `+page.server.ts` form actions for: user form submissions (POST via `<form>`), page-local mutations tied to a specific route
- Form actions CAN import and call remote mutations internally if needed
- Rule of thumb: if it's a `<form>` → form action. If it's a button click or data load → remote function.

### Database Migrations

- After modifying `src/db/schema.ts`, run `make db-push` to push changes to Turso
- Tests mock the DB via vitest aliases — no real DB needed during `make test`
- For testing Drizzle query logic: mock `$lib/server/db` with `vi.mock()`

### Forms

- ALL forms MUST use SvelteKit form actions + SuperForms + Zod validation
- Server: `superValidate(zod4(schema))` → actions → `fail(400, {form})` or `message(form, '...')`
- Client: `superForm(data.form)` → `{form, errors, enhance, message}` → `<form use:enhance>`
- No manual fetch/POST calls for form submissions

### Tables

- ALL data tables MUST use TanStack Table (`@tanstack/svelte-table`)
- Use the reusable `DataTable.svelte` wrapper in `src/lib/components/`
- ShadCN `table` component for styling

### UI Components — ShadCN-first

- Before creating ANY new UI component, check if it exists:
  1. `bunx shadcn-svelte@next add <name> --no-git` (shadcn-svelte registry, non-interactive)
  2. `bunx jsrepo add <name> --yes` (shadcn-svelte-extras registry, non-interactive)
- ALWAYS use `--no-git` / `--yes` flags to avoid interactive prompts (loop runs unattended)
- Only hand-write a component if NEITHER registry has it
- NEVER hand-write Dialog, Select, Table, Dropdown, Popover, Checkbox, RadioGroup, etc.

### i18n

- ALL user-facing text MUST use `i18nRune.t('key')` — no hardcoded German text in components
- TypeScript enum/union values MUST be English internal keys (e.g. 'planned', NOT 'geplant'). Display via `i18n.t('status.planned')`
- Locale files in `static/locales/{lang}.json`
- German (de.json) loaded on startup; other locales lazy-loaded on demand
- i18nRune initialized in (app)/+layout.svelte via setContext()
- Consume in components: `const i18n = getContext<I18nRune>('i18n')`
- Searchable multiselects: use ShadCN `popover` + `command` (combobox pattern)

### State Management

- Shared state: rune-based classes in `src/lib/state/`, initialized via `setContext()` in root layout
- Page-local state: `$state()` runes in components
- NOT module-level singletons (breaks SSR)

### Navigation

- Use `<a href="/path">` for links
- Use `goto('/path')` from `$app/navigation` for programmatic navigation
- Active state: check `$page.url.pathname` from `$app/state`
- NEVER use custom navigateToPage() functions

### Testing

- Tests focus on server logic: remote functions, Zod schemas, utilities, data transformations
- Do NOT write component render tests (Svelte 5 runes + jsdom has known issues)
- Test files: `*.test.ts` next to the file being tested

### Error Handling

- Form errors: SuperForms `$errors` for field-level display
- User notifications: `toast.success()` / `toast.error()` from `svelte-sonner`
- Confirmation dialogs: ShadCN `alert-dialog` — NEVER use `window.confirm()`

### Auth & Security

- (app)/+layout.server.ts MUST have a single auth guard: `if (!locals.user) redirect(302, '/login')` — protects ALL child routes
- **Organization-based tenancy:** Users belong to an organization. Use better-auth organization plugin.
- Every Drizzle table (except auth/org tables) MUST have an `organizationId` column — NOT userId
- Every DB query MUST filter by the user's active `organizationId` — users only see their org's data
- Remote functions: access current user + org via `getRequestEvent()` → `event.locals.user` / `event.locals.session`
- Form actions: ALWAYS verify `locals.user` exists before mutating data
- NEVER use `{@html}` without sanitization (use isomorphic-dompurify, already installed)
- File uploads: validate MIME type on SERVER side, not just client side
- NEVER log sensitive data (passwords, tokens, session secrets) to console
- **NEVER hardcode secrets, API keys, tokens, passwords, or credentials** in source code. All secrets MUST come from environment variables via `$env/dynamic/private` or `$env/static/private`. If a new secret is needed, add a placeholder to `.env.template` and document it — never put the actual value in code.
- NEVER commit `.env` files (already in .gitignore). Only `.env.template` with empty placeholders may be committed.
- Before every `git add -A`: mentally verify no secrets are staged. If a file contains secrets, add it to `.gitignore`.

### Styling & Design

- **Use the frontend-design skill** (`.claude/skills/frontend-design.md`) for ALL UI implementation tasks ([IMPL] with UI). Invoke it to get production-grade, visually polished components.
- Theme defined in `src/routes/layout.css` — OKLCH color system with light + dark mode:
  - **Brand colors:** `bg-brand`, `text-brand` (teal-blue primary)
  - **Accent system:** `bg-accent-mid` (medium depth), `bg-accent-deep` (deepest)
  - **Surface:** `bg-surface-light` (subtle background for sections)
  - **Standard ShadCN:** `bg-primary`, `bg-secondary`, `bg-muted`, `bg-card`, `bg-destructive`
  - **Chart colors:** `bg-chart-1` through `bg-chart-5` (for dashboard statistics)
- **Fonts:** `font-display` (Plus Jakarta Sans — headings), `font-body` (DM Sans — text). Use via `style="font-family: var(--font-display)"` or Tailwind classes.
- **Animations available:** `animate-fade-up`, `animate-float-slow`, `animate-float-slower`, `animate-slide-in-left`, `animate-pulse-glow`, `animate-shimmer` (defined in layout.css)
- **Grain overlay:** Apply `grain` class for subtle texture on hero sections
- **Page layout pattern:** max-width container with consistent padding:
  ```svelte
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
  	<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">{i18n.t('page.title')}</h1>
  	<!-- content -->
  </div>
  ```
- **Card grid pattern:** for dashboard/list pages:
  ```svelte
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  	<Card.Root>...</Card.Root>
  </div>
  ```
- **Form layout pattern:** two-column on desktop, single on mobile:
  ```svelte
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
  	<!-- field pairs -->
  </div>
  ```
- Always support dark mode — use ShadCN semantic colors (`bg-card`, `text-foreground`), never hardcode hex colors.

### Date Handling

- Use `@internationalized/date` (already installed) for all date/time operations
- Do NOT add date-fns — it's unnecessary. Use @internationalized/date for locale-aware formatting.

### Icons

- Use `@lucide/svelte` for UI icons: `import IconName from '@lucide/svelte/icons/icon-name'`
- App logos: `static/logo_dark.png`, `static/logo_light.png`

### Off-Limits Files

- **NEVER read `requirements.md`** — it contains outdated patterns (localStorage, German type values, navigateToPage()). ALL requirements are already translated into `specs/*.md` files. Only read spec files.

## Learnings

(Ralph adds discovered patterns and gotchas here)
- shadcn-svelte CLI: use `@latest` (not `@next`) with `echo "y" | bunx shadcn-svelte@latest add ... --overwrite` for non-interactive install. The `--no-git` flag does not exist.
- The `.vercel/` build output directory must be in eslint ignores to avoid linting generated code.
- Prettier SyntaxError on `columns: [...]` in specs/01-architektur.md code blocks is a harmless warning — prettier still reports all files pass.
- `copy-button` component depends on `ButtonPropsWithoutHTML` which was removed in newer shadcn button — fixed to use `ButtonVariant`/`ButtonSize` directly.
