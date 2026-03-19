import { query, command } from '$app/server';
import type { SavedPlan, SavedDocumentCreate } from '$lib/types';

export const getSavedPlans = query(async (): Promise<SavedPlan[]> => {
	throw new Error('Not implemented');
});

export const getSavedPlanById = query('unchecked', async (_id: string): Promise<SavedPlan | null> => {
	throw new Error('Not implemented');
});

export const savePlan = command('unchecked', async (_data: SavedDocumentCreate): Promise<SavedPlan> => {
	throw new Error('Not implemented');
});

export const updatePlan = command('unchecked', async (_payload: { id: string; data: SavedDocumentCreate }): Promise<SavedPlan> => {
	throw new Error('Not implemented');
});

export const deletePlan = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
