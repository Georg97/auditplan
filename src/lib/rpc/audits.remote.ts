import { query, command } from '$app/server';

export const getAudits = query(async () => {
	throw new Error('Not implemented');
});

export const addAudit = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const editAudit = command('unchecked', async (_input: { id: string; data: unknown }) => {
	throw new Error('Not implemented');
});

export const deleteAudit = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const uploadAuditFile = command('unchecked', async (_input: { auditId: string; fileData: unknown }) => {
	throw new Error('Not implemented');
});

export const deleteAuditFile = command('unchecked', async (_fileId: string) => {
	throw new Error('Not implemented');
});
