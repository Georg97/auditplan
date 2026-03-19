import { query, command } from '$app/server';
import type { Audit, AuditCreate, AuditUpdate, AuditFile, AuditFileCreate } from '$lib/types';

export const getAudits = query(async (): Promise<Audit[]> => {
	throw new Error('Not implemented');
});

export const getAuditById = query('unchecked', async (_id: string): Promise<Audit | null> => {
	throw new Error('Not implemented');
});

export const addAudit = command('unchecked', async (_data: AuditCreate): Promise<Audit> => {
	throw new Error('Not implemented');
});

export const updateAudit = command('unchecked', async (_payload: { id: string; data: AuditUpdate }): Promise<Audit> => {
	throw new Error('Not implemented');
});

export const deleteAudit = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});

export const searchAudits = query('unchecked', async (_searchTerm: string): Promise<Audit[]> => {
	throw new Error('Not implemented');
});

export const getAuditFiles = query('unchecked', async (_auditId: string): Promise<AuditFile[]> => {
	throw new Error('Not implemented');
});

export const uploadAuditFile = command('unchecked', async (_data: AuditFileCreate): Promise<AuditFile> => {
	throw new Error('Not implemented');
});

export const deleteAuditFile = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
