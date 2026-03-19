import { query, command } from '$app/server';
import type { AuditPlan } from '$lib/types/audit-plan';

export const getAuditPlans = query(async (): Promise<AuditPlan[]> => {
	throw new Error('Not implemented');
});

export const getAuditPlan = query('unchecked', async (_id: string): Promise<AuditPlan | null> => {
	throw new Error('Not implemented');
});

export const saveAuditPlan = command('unchecked', async (_data: unknown): Promise<AuditPlan> => {
	throw new Error('Not implemented');
});

export const deleteAuditPlan = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
