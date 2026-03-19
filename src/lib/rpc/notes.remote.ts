import { query, command } from '$app/server';
import type { SavedNotes, SavedDocumentCreate } from '$lib/types';

export const getSavedNotes = query(async (): Promise<SavedNotes[]> => {
	throw new Error('Not implemented');
});

export const getSavedNoteById = query('unchecked', async (_id: string): Promise<SavedNotes | null> => {
	throw new Error('Not implemented');
});

export const saveNote = command('unchecked', async (_data: SavedDocumentCreate): Promise<SavedNotes> => {
	throw new Error('Not implemented');
});

export const updateNote = command('unchecked', async (_payload: { id: string; data: SavedDocumentCreate }): Promise<SavedNotes> => {
	throw new Error('Not implemented');
});

export const deleteNote = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
