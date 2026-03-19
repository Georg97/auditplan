import { query, command } from '$app/server';
import type { AppSettings } from '$lib/types/settings';

export const getSettings = query(async (): Promise<AppSettings | null> => {
	throw new Error('Not implemented');
});

export const saveSettings = command('unchecked', async (_data: AppSettings): Promise<void> => {
	throw new Error('Not implemented');
});
