import { query, command } from '$app/server';
import type { Auditor, AuditorCreate, AuditorUpdate } from '$lib/types';

export const getAuditors = query(async (): Promise<Auditor[]> => {
	throw new Error('Not implemented');
});

export const getAuditorById = query('unchecked', async (_id: string): Promise<Auditor | null> => {
	throw new Error('Not implemented');
});

export const addAuditor = command('unchecked', async (_data: AuditorCreate): Promise<Auditor> => {
	throw new Error('Not implemented');
});

export const updateAuditor = command('unchecked', async (_payload: { id: string; data: AuditorUpdate }): Promise<Auditor> => {
	throw new Error('Not implemented');
});

export const deleteAuditor = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
