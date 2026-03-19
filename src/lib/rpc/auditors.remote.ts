import { query, command } from '$app/server';

export const getAuditors = query(async () => {
	throw new Error('Not implemented');
});

export const getAuditorById = query('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const addAuditor = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const updateAuditor = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const deleteAuditor = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});
