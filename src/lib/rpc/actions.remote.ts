import { query, command } from '$app/server';

export const getActions = query(async () => {
	throw new Error('Not implemented');
});

export const getActionById = query('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const addAction = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const updateAction = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const deleteAction = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});
