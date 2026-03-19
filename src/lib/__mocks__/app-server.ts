// Mock for $app/server — used in vitest to resolve remote function imports
// In tests, query() and command() return the async function directly (no RPC wrapper)
// query() can be called with just a function, or with 'unchecked' + function
// command() is always called with 'unchecked' + function

export function query<T>(...args: unknown[]): T {
	// If called as query('unchecked', fn), return fn
	// If called as query(fn), return fn
	return (args.length === 2 ? args[1] : args[0]) as T;
}

export function command<T>(_flag: string, fn: T): T {
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
