// Mock for $app/server — used in vitest to resolve remote function imports
// In tests, query() and command() return the async function directly (no RPC wrapper)

export function query<T>(validate_or_fn: T | string, maybe_fn?: T): T {
	return maybe_fn ?? (validate_or_fn as T);
}

export function command<T>(validate_or_fn: T | string, maybe_fn?: T): T {
	return maybe_fn ?? (validate_or_fn as T);
}

export function getRequestEvent() {
	return {
		locals: {
			user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
			session: { activeOrganizationId: 'test-org-id' }
		},
		request: new Request('http://localhost'),
		url: new URL('http://localhost')
	};
}
