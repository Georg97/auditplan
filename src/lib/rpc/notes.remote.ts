import { query, command } from '$app/server';
import type { AuditNotes } from '$lib/types/audit-notes';

export const getAuditNotesList = query(async (): Promise<AuditNotes[]> => {
	throw new Error('Not implemented');
});

export const getAuditNotes = query('unchecked', async (_id: string): Promise<AuditNotes | null> => {
	throw new Error('Not implemented');
});

export const saveAuditNotes = command('unchecked', async (_data: unknown): Promise<AuditNotes> => {
	throw new Error('Not implemented');
});

export const deleteAuditNotes = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
