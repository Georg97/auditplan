.PHONY: check check-no-test format format-check lint typecheck test dev build db-push

# Full validation gate (format + typecheck + lint + test)
check: format-check typecheck lint test
	@echo "All checks passed."

# Validation without tests (for IFACE/TEST phases)
check-no-test: format-check typecheck lint
	@echo "Format + typecheck + lint passed."

# Check formatting (no write)
format-check:
	bunx prettier --check .

# Auto-fix formatting
format:
	bun run format

# Type checking via svelte-check
typecheck:
	bun run check

# Lint with eslint
lint:
	bun run lint

# Run tests
test:
	bun run test

# Dev server
dev:
	bun run dev

# Production build
build:
	bun run build

# Push Drizzle schema changes to Turso (run after modifying src/db/schema.ts)
db-push:
	bunx drizzle-kit push
