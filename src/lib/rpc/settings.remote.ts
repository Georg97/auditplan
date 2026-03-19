import { query, command } from '$app/server';
import { appSettingsSchema, type AppSettings } from '$lib/types';

export const getSettings = query(async (): Promise<AppSettings> => {
	throw new Error('Not implemented');
});

export const saveSettings = command('unchecked', async (_data: Partial<AppSettings>): Promise<void> => {
	throw new Error('Not implemented');
});

export const exportAllData = query(async (): Promise<Record<string, unknown>> => {
	throw new Error('Not implemented');
});

export const importAllData = command('unchecked', async (_data: Record<string, unknown>): Promise<void> => {
	throw new Error('Not implemented');
});

export const deleteAllData = command(async (): Promise<void> => {
	throw new Error('Not implemented');
});

// Re-export schema for use in tests and components
export { appSettingsSchema };
