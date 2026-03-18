import { query, command } from '$app/server';

export const getAuditors = query(async () => {
	throw new Error('Not implemented');
});

export const addAuditor = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const editAuditor = command('unchecked', async (_input: { id: string; data: unknown }) => {
	throw new Error('Not implemented');
});

export const deleteAuditor = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});
