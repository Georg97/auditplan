import { query, command } from '$app/server';
import type { AuditorFormData } from '$lib/types/auditor';

export const getAuditors = query(async () => {
	throw new Error('Not implemented');
});

export const addAuditor = command('unchecked', async (_data: AuditorFormData) => {
	throw new Error('Not implemented');
});

export const editAuditor = command('unchecked', async (_input: { id: string; data: AuditorFormData }) => {
	throw new Error('Not implemented');
});

export const deleteAuditor = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});
