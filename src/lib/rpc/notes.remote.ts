import { query, command } from '$app/server';

export const getSavedNotes = query(async () => {
	throw new Error('Not implemented');
});

export const getSavedNoteById = query('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const saveNote = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const updateNote = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const deleteNote = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});
