import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { auditors } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import type { AuditorFormData } from '$lib/types/auditor';

function getOrgId(): string {
	const event = getRequestEvent();
	const orgId = event?.locals?.session?.activeOrganizationId;
	if (!orgId) throw new Error('No active organization');
	return orgId;
}

export const getAuditors = query(async () => {
	const orgId = getOrgId();
	return db.select().from(auditors).where(eq(auditors.organizationId, orgId));
});

export const getAuditorById = command('unchecked', async (id: string) => {
	const orgId = getOrgId();
	const [result] = await db
		.select()
		.from(auditors)
		.where(and(eq(auditors.id, id), eq(auditors.organizationId, orgId)));
	return result ?? null;
});

export const addAuditor = command('unchecked', async (data: AuditorFormData) => {
	const orgId = getOrgId();
	const [result] = await db
		.insert(auditors)
		.values({
			...data,
			organizationId: orgId
		})
		.returning();
	return result;
});

export const editAuditor = command('unchecked', async (input: { id: string; data: AuditorFormData }) => {
	const orgId = getOrgId();
	const [result] = await db
		.update(auditors)
		.set({
			...input.data,
			updatedAt: new Date()
		})
		.where(and(eq(auditors.id, input.id), eq(auditors.organizationId, orgId)))
		.returning();
	return result;
});

export const deleteAuditor = command('unchecked', async (id: string) => {
	const orgId = getOrgId();
	await db.delete(auditors).where(and(eq(auditors.id, id), eq(auditors.organizationId, orgId)));
});
