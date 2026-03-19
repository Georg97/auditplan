import { query, command } from '$app/server';
import type { Audit, AuditFormData } from '$lib/types/audit';

export const getAudits = query(async (): Promise<Audit[]> => {
	throw new Error('Not implemented');
});

export const getAudit = query('unchecked', async (_id: string): Promise<Audit | null> => {
	throw new Error('Not implemented');
});

export const addAudit = command('unchecked', async (_data: AuditFormData): Promise<Audit> => {
	throw new Error('Not implemented');
});

export const editAudit = command('unchecked', async (_args: { id: string; data: AuditFormData }): Promise<Audit> => {
	throw new Error('Not implemented');
});

export const deleteAudit = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
