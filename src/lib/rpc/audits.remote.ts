import { query, command, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { audits, auditDateien } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import type { AuditFormData } from '$lib/types/audit';

function getOrgId(): string {
	const event = getRequestEvent();
	const orgId = event?.locals?.session?.activeOrganizationId;
	if (!orgId) throw new Error('No active organization');
	return orgId;
}

export const getAudits = query(async () => {
	const orgId = getOrgId();
	return db.select().from(audits).where(eq(audits.organizationId, orgId));
});

export const addAudit = command('unchecked', async (data: AuditFormData) => {
	const orgId = getOrgId();
	const [result] = await db
		.insert(audits)
		.values({
			...data,
			organizationId: orgId
		})
		.returning();
	return result;
});

export const editAudit = command('unchecked', async (input: { id: string; data: AuditFormData }) => {
	const orgId = getOrgId();
	const [result] = await db
		.update(audits)
		.set({
			...input.data,
			updatedAt: new Date()
		})
		.where(and(eq(audits.id, input.id), eq(audits.organizationId, orgId)))
		.returning();
	return result;
});

export const deleteAudit = command('unchecked', async (id: string) => {
	const orgId = getOrgId();
	await db.delete(audits).where(and(eq(audits.id, id), eq(audits.organizationId, orgId)));
});

export const uploadAuditFile = command('unchecked', async (input: { auditId: string; dateiName: string; dateiTyp: string; dateiGroesse: number; dateiInhalt: string }) => {
	const [result] = await db
		.insert(auditDateien)
		.values({
			auditId: input.auditId,
			dateiName: input.dateiName,
			dateiTyp: input.dateiTyp,
			dateiGroesse: input.dateiGroesse,
			dateiInhalt: input.dateiInhalt
		})
		.returning();
	return result;
});

export const deleteAuditFile = command('unchecked', async (id: string) => {
	await db.delete(auditDateien).where(eq(auditDateien.id, id));
});
