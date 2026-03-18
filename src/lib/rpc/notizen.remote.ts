import { query, command } from '$app/server';

export const getSavedNotes = query(async () => {
	throw new Error('Not implemented');
});

export const saveNotes = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const editSavedNotes = command('unchecked', async (_input: { id: string; data: unknown }) => {
	throw new Error('Not implemented');
});

export const deleteSavedNotes = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});
