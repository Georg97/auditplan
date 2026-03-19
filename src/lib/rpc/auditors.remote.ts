import { query, command } from '$app/server';
import type { Auditor, AuditorFormData } from '$lib/types/auditor';

export const getAuditors = query(async (): Promise<Auditor[]> => {
	throw new Error('Not implemented');
});

export const getAuditor = query('unchecked', async (_id: string): Promise<Auditor | null> => {
	throw new Error('Not implemented');
});

export const addAuditor = command('unchecked', async (_data: AuditorFormData): Promise<Auditor> => {
	throw new Error('Not implemented');
});

export const editAuditor = command('unchecked', async (_args: { id: string; data: AuditorFormData }): Promise<Auditor> => {
	throw new Error('Not implemented');
});

export const deleteAuditor = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
