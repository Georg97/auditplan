// Mock for $app/navigation
export async function goto(url: string) {
	return url;
}

export function invalidate(url: string) {
	return url;
}

export function invalidateAll() {
	return;
}
