import { query, command } from '$app/server';

export const getSettings = query(async () => {
	throw new Error('Not implemented');
});

export const saveSettings = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const exportAllData = query(async () => {
	throw new Error('Not implemented');
});

export const importAllData = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const deleteAllData = command(async () => {
	throw new Error('Not implemented');
});
