import { query, command } from '$app/server';

export const getSavedAuditQuestions = query(async () => {
	throw new Error('Not implemented');
});

export const saveAuditQuestions = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const editSavedAuditQuestions = command('unchecked', async (_input: { id: string; data: unknown }) => {
	throw new Error('Not implemented');
});

export const deleteSavedAuditQuestions = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});
