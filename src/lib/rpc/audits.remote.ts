import { query, command } from '$app/server';

export const getAudits = query(async () => {
	throw new Error('Not implemented');
});

export const getAuditById = query('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const addAudit = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const updateAudit = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const deleteAudit = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const searchAudits = query('unchecked', async (_searchTerm: string) => {
	throw new Error('Not implemented');
});
