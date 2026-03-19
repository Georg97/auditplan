import { query, command } from '$app/server';

export const getSavedPlans = query(async () => {
	throw new Error('Not implemented');
});

export const getSavedPlanById = query('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const savePlan = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const updatePlan = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const deletePlan = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});
