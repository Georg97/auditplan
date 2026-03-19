import { query, command } from '$app/server';
import type { Action, ActionFormData } from '$lib/types/action';

export const getActions = query(async (): Promise<Action[]> => {
	throw new Error('Not implemented');
});

export const addAction = command('unchecked', async (_data: ActionFormData): Promise<Action> => {
	throw new Error('Not implemented');
});

export const editAction = command('unchecked', async (_args: { id: string; data: ActionFormData }): Promise<Action> => {
	throw new Error('Not implemented');
});

export const deleteAction = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
