import { query, command } from '$app/server';

export const getSavedPlans = query(async () => {
	throw new Error('Not implemented');
});

export const savePlan = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const editSavedPlan = command('unchecked', async (_input: { id: string; data: unknown }) => {
	throw new Error('Not implemented');
});

export const deleteSavedPlan = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});
