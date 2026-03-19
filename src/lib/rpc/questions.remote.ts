import { query, command } from '$app/server';
import type { SavedAuditQuestions } from '$lib/types/audit-questions';

export const getSavedAuditQuestionsList = query(async (): Promise<SavedAuditQuestions[]> => {
	throw new Error('Not implemented');
});

export const getSavedAuditQuestions = query('unchecked', async (_id: string): Promise<SavedAuditQuestions | null> => {
	throw new Error('Not implemented');
});

export const saveAuditQuestions = command('unchecked', async (_data: unknown): Promise<SavedAuditQuestions> => {
	throw new Error('Not implemented');
});

export const deleteAuditQuestions = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
