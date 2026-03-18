# PROMPT.md — Smarthome Assistant Ralph Loop

You are building a self-hosted smarthome assistant server in Python. Each iteration you complete ONE task from fix_plan.md.

## Step 1: ORIENT

1. Read `@CLAUDE.md` to learn build commands and previous learnings.
2. Read `@fix_plan.md` to see the prioritized task list.
3. Use up to 100 subagents in parallel to analyze the codebase. DO NOT assume features are not implemented — subagents must verify by searching.
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
- Write the ABC/Protocol/class with full type signatures and docstrings.
- Write a stub implementation that raises `NotImplementedError` for every method.
- DO NOT write tests yet.
- Verification: `make check-no-test`

### `[TEST]` — Test Suite from Spec
- Read ONLY the spec file + the interface file (ABC/Protocol).
- **DO NOT read any implementation files.** This is critical — tests must be written from the spec, not from existing code.
- Write tests with rich docstrings explaining **why** each test exists. These docstrings serve as living documentation for future iterations.
- Test names must be spec assertions: `test_X_does_Y_when_Z`
- Verification: `make check-no-test` (tests may fail against stubs — that's expected)

### `[IMPL]` — Implementation
- Read the relevant tests and interface for the current task.
- Implement until tests for this component pass.
- No placeholders, no shortcuts, no incomplete implementations.
- Verification: `make check` (ALL four gates must pass: format + typecheck + lint + test)

### `[WIRE]` — Integration
- Read only the interfaces of the components being connected.
- Write integration test, then implement the wiring.
- Verification: `make check` (ALL four gates must pass)

## Step 4: REPAIR

Run `make check`. If tests OUTSIDE your current task fail:

1. Read the failing test's docstring to understand what it verifies and why.
2. If the docstring is insufficient, read the spec that the test belongs to.
3. Fix the regression without breaking the current task's tests.
4. Do NOT load the entire codebase — stay focused on the failing test's context.

## Step 5: COMMIT

1. Update `@fix_plan.md` — mark the completed task as `[x]`, add any newly discovered issues.
2. Update `@AGENT.md` if you learned something new about building, testing, or running the system.
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
- **Windows target.** Code targets Windows with CUDA. CPU fallback for machines without GPU. No macOS/MPS support needed.
- **If stuck:** Document the blocker in fix_plan.md with details, then skip to the next task.
- **Do NOT place status reports in AGENT.md.** Only build/test knowledge and learnings.
- **NEVER ask questions or wait for human input.** You are running unattended. Make decisions autonomously based on the specs. If something is ambiguous, make the reasonable choice, document your reasoning in the commit message, and move on.
- **NEVER use interactive commands.** All commands must run non-interactively. No prompts, no confirmations, no interactive editors.

