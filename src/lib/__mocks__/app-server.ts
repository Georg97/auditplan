// Mock for $app/server — used in vitest to resolve remote function imports
// In tests, query() and mutation() return the async function directly (no RPC wrapper)

export function query<T>(fn: T): T {
	return fn;
}

export function mutation<T>(fn: T): T {
	return fn;
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
