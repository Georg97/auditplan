import { query } from '$app/server';
import type { DashboardData, AuditListItem, AuditStatus } from '$lib/types';

export const getDashboardData = query(async (): Promise<DashboardData> => {
	throw new Error('Not implemented');
});

export const getFilteredAudits = query('unchecked', async (_status: AuditStatus | 'all'): Promise<AuditListItem[]> => {
	throw new Error('Not implemented');
});
