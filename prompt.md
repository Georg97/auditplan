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
- Write Vitest tests in `src/**/*.test.ts`. For server functions, test the logic directly. For components, test with `@testing-library/svelte` if feasible, otherwise test underlying logic/stores.
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
- **German UI.** The application interface is in German. Specs are in German. Code comments and commit messages may be English.
- **Svelte 5 patterns.** Use `let { prop } = $props()` for props. Use `$state()` for reactive state. Use `$derived()` for computed values. Use `$effect()` for side effects. Import ShadCN components from `$lib/components/ui/`.
- **Context management.** This is a large project (~29 modules). NEVER load all route files at once. Load only the spec + the files mentioned in the task. If you need to understand a pattern, look at ONE existing implementation, not all of them.
- **If stuck:** Document the blocker in fix_plan.md with details, then skip to the next task.
- **Do NOT place status reports in CLAUDE.md.** Only build/test knowledge and learnings.
- **NEVER ask questions or wait for human input.** You are running unattended. Make decisions autonomously based on the specs. If something is ambiguous, make the reasonable choice, document your reasoning in the commit message, and move on.
- **NEVER use interactive commands.** All commands must run non-interactively. No prompts, no confirmations, no interactive editors.
