# PROMPT.md — ISO Audit Manager Ralph Loop

You are building "Der ISO Audit Manager", a SvelteKit web application for ISO audit planning and documentation. The stack: SvelteKit + Svelte 5, Tailwind CSS 4, Bits UI (ShadCN-style), Drizzle ORM + Turso, better-auth, Bun. Each iteration you complete ONE task from fix_plan.md.

## Step 1: ORIENT

1. Read `@CLAUDE.md` to learn build commands and previous learnings.
2. Read `@fix_plan.md` to see the prioritized task list.
3. Use up to 100 subagents in parallel to analyze the codebase. Focus on `src/lib/`, `src/routes/`, `src/db/`, and `specs/`. DO NOT assume features are not implemented — subagents must verify by searching.
4. Select the **next highest-priority incomplete task**. Never skip to a lower priority phase while higher priority tasks remain incomplete.
5. **If ALL tasks in fix_plan.md are marked `[x]` and `make check` passes:** Create a file called `LOOP_DONE` in the project root containing the text "ALL_TASKS_COMPLETE", then exit. The loop will detect this and stop.

## Step 2: FOCUS

1. Read ONLY the spec file(s) listed in the task description (from `specs/`).
2. Read ONLY the interface files relevant to the selected task.
3. Do NOT read unrelated specs or implementation code. Avoid context rot.

## Step 3: EXECUTE

Execute based on the task tag:

### `[SETUP]` — Infrastructure

- Create the specified infrastructure files.
- Verification: `make check-no-test`

### `[IFACE]` — Interface Definition

- Read the relevant `specs/` file.
- Write TypeScript interfaces/types in `src/lib/types/`.
- Write server function signatures in `.remote.ts` files with stub implementations that throw `Error('Not implemented')`.
- Write Svelte component prop types where needed.
- DO NOT write tests yet.
- Verification: `make check-no-test`

### `[TEST]` — Test Suite from Spec

- Read ONLY the spec file + the interface/type files.
- **DO NOT read any implementation files.** Tests must be written from the spec, not from existing code.
- Write Vitest tests in `src/**/*.test.ts`. Test server functions, Zod schemas, utility functions, and data transformations.
- **Do NOT write component render tests.** Svelte 5 runes + jsdom has known issues. Focus on logic testing only.
- Write tests with rich comments explaining **why** each test exists. These serve as living documentation for future iterations.
- Test names must be spec assertions: `test_X_does_Y_when_Z`
- Verification: `make check-no-test` (tests may fail against stubs — that's expected)

### `[IMPL]` — Implementation

- Read the relevant tests and interfaces for the current task.
- For pages: implement in `src/routes/(app)/[page-name]/+page.svelte` with optional `+page.server.ts`.
- For server data: use remote functions (`.remote.ts` with `query()` / `mutation()`) or `+page.server.ts` load functions.
- For shared components: place in `src/lib/components/`.
- For database operations: use Drizzle queries in server-side code only.
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`) — NOT Svelte 4 stores.
- Use `{@render children()}` — NOT `<slot/>`.
- No placeholders, no shortcuts, no incomplete implementations.
- Verification: `make check` (ALL four gates must pass: format + typecheck + lint + test)

### `[WIRE]` — Integration

- Read only the interfaces/types of the components being connected.
- For page-to-page connections, verify data flows through server functions.
- For component composition, verify props pass correctly.
- Write integration test, then implement the wiring.
- Verification: `make check` (ALL four gates must pass)

### `[SMOKE]` — End-to-end Smoke Test

- Write a comprehensive test verifying a user-facing flow end-to-end.
- Verification: `make check`

## Step 3.5: E2E VERIFY (after [IMPL] and [WIRE] tasks with UI changes)

Use the Playwright MCP tools to verify your UI implementation in a real browser. Playwright runs its own isolated Chromium — it does NOT touch the user's browser.

1. **Start the dev server** (if not already running): `bun run dev &` (background process on port 5173)
2. **Log in**: Navigate to `http://localhost:5173/login`, enter test credentials from env vars `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`, submit the form
3. **Navigate** to the page you just implemented or modified
4. **Verify** key UI elements:
   - Page renders without errors
   - Key text/labels are visible (use `browser_snapshot` to inspect the accessibility tree)
   - Interactive elements work (buttons, forms, navigation)
   - Data loads correctly from the server
5. **If something looks wrong**: take a `browser_screenshot`, diagnose the issue, fix it, and re-verify
6. **Close the browser** when done with `browser_close`

**Important:**
- Use `browser_snapshot` (accessibility tree) over `browser_screenshot` (image) to save tokens — only screenshot when debugging visual issues
- Don't spend more than 2-3 minutes on E2E verification per iteration
- If the dev server fails to start (e.g. port in use), skip E2E and note it in the commit message

## Step 3.9: FINAL CHECKUP (before committing)

After REPAIR passes, do a quick browser walkthrough of the page you modified:
1. Navigate to the relevant page (log in if needed)
2. Take a `browser_snapshot` to confirm the page renders correctly
3. If anything is broken, fix it before committing
4. Close the browser with `browser_close`

## Step 4: REPAIR

Run `make check`. If tests OUTSIDE your current task fail:

1. Read the failing test's comments to understand what it verifies and why.
2. If insufficient, read the spec that the test belongs to.
3. Fix the regression without breaking the current task's tests.
4. Do NOT load the entire codebase — stay focused on the failing test's context.

## Step 5: COMMIT

1. Update `@fix_plan.md` — mark the completed task as `[x]`, add any newly discovered issues.
2. Update `@CLAUDE.md` Learnings section if you learned something new about building, testing, or running the system.
3. Commit and push:

```bash
git add -A
git commit -m "descriptive message about what was implemented"
git push
```

## Rules

- **One task per iteration.** Pick one, finish it, commit it.
- **No placeholders.** Every implementation must be complete and functional.
- **Specs are truth.** If your implementation contradicts a spec, the spec wins. If a spec is wrong, update it AND implement correctly.
- **SvelteKit conventions.** Use file-based routing. Server code in `+page.server.ts` or `.remote.ts` files. Client state with Svelte 5 runes. Styling with Tailwind utility classes and ShadCN components from `$lib/components/ui/`.
- **Use bun.** `bun add` for new dependencies, `bun run` for scripts. Never npm/yarn/pnpm.
- **German UI via i18n.** ALL user-facing text MUST use `i18nRune.t('key')`. No hardcoded German strings in components. Translation keys in `static/locales/de.json`.
- **Svelte 5 patterns.** Use `let { prop } = $props()` for props. Use `$state()` for reactive state. Use `$derived()` for computed values. Use `$effect()` for side effects. Import ShadCN components from `$lib/components/ui/`.
- **Context management.** This is a large project (~29 modules). NEVER load all route files at once. Load only the spec + the files mentioned in the task. If you need to understand a pattern, look at ONE existing implementation, not all of them.
- **If stuck:** Document the blocker in fix_plan.md with details, then skip to the next task.
- **Do NOT place status reports in CLAUDE.md.** Only build/test knowledge and learnings.
- **NEVER ask questions or wait for human input.** You are running unattended. Make decisions autonomously based on the specs. If something is ambiguous, make the reasonable choice, document your reasoning in the commit message, and move on.
- **NEVER use interactive commands.** All commands must run non-interactively. No prompts, no confirmations, no interactive editors.

## Prohibitions (CRITICAL — violating these wastes iterations)

- **NEVER use localStorage** for data persistence. All data goes through Drizzle ORM + Turso via remote functions (query/mutation). The requirements.md mentions localStorage — IGNORE that, use the server DB.
- **NEVER use `window.confirm()`** — use ShadCN `alert-dialog` component instead.
- **NEVER hand-write a UI component** that exists in shadcn-svelte or shadcn-svelte-extras. Install it: `bunx shadcn-svelte@next add <name>` or `bunx jsrepo add <name>`.
- **NEVER write component render tests** — test server logic, Zod schemas, and utilities only. Svelte 5 runes + jsdom has known issues.
- **NEVER use manual fetch/POST** for form submissions — ALL forms use SuperForms + Zod.
- **NEVER create custom table implementations** — ALL data tables use TanStack Table (`@tanstack/svelte-table`) with the DataTable.svelte wrapper.
- **NEVER use custom `navigateToPage()` functions** — use SvelteKit `<a href>` and `goto()` from `$app/navigation`.
- **NEVER hardcode German text in components** — use `i18nRune.t('key')` for ALL user-facing strings.
- **TypeScript enum/union values MUST be English internal keys** — not German display text. Use `type AuditStatus = 'planned' | 'in_progress' | 'completed'`, NOT `'geplant' | 'in Bearbeitung' | 'abgeschlossen'`. Display text comes from `i18n.t('audit.status.planned')`.
- **Searchable multiselects MUST use ShadCN `popover` + `command`** components (combobox pattern). NEVER build a custom dropdown from scratch.
- **NEVER create a page or form action without auth check.** The `(app)/+layout.server.ts` has a global auth guard, but form actions in `+page.server.ts` MUST still verify `locals.user` before mutating data.
- **NEVER create a DB table without `organizationId` column** (except auth/org tables). Every query MUST filter by the user's active `organizationId` — users must only see their organization's data. This is organization-based tenancy, NOT per-user isolation.
- **NEVER use `{@html}`** without sanitizing via `isomorphic-dompurify` (already installed). User-generated content is untrusted.
- **NEVER log sensitive data** (passwords, tokens, secrets) to console — remove all `console.log` of form data before committing.
