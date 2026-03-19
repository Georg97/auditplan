import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { savedAuditQuestions } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

function getOrgId(): string {
	const event = getRequestEvent();
	const orgId = event?.locals?.session?.activeOrganizationId;
	if (!orgId) throw new Error('No active organization');
	return orgId;
}

export const getSavedAuditQuestions = query(async () => {
	const orgId = getOrgId();
	return db.select().from(savedAuditQuestions).where(eq(savedAuditQuestions.organizationId, orgId));
});

export const getSavedAuditQuestionsById = command('unchecked', async (id: string) => {
	const orgId = getOrgId();
	const [result] = await db
		.select()
		.from(savedAuditQuestions)
		.where(and(eq(savedAuditQuestions.id, id), eq(savedAuditQuestions.organizationId, orgId)));
	return result ?? null;
});

export const saveAuditQuestions = command('unchecked', async (data: { name: string; formData: string; questions: string; documents: string }) => {
	const orgId = getOrgId();
	const [result] = await db
		.insert(savedAuditQuestions)
		.values({
			organizationId: orgId,
			name: data.name,
			formData: data.formData,
			questions: data.questions,
			documents: data.documents
		})
		.returning();
	return result;
});

export const editSavedAuditQuestions = command('unchecked', async (input: { id: string; data: { name: string; formData: string; questions: string; documents: string } }) => {
	const orgId = getOrgId();
	const [result] = await db
		.update(savedAuditQuestions)
		.set({
			name: input.data.name,
			formData: input.data.formData,
			questions: input.data.questions,
			documents: input.data.documents,
			updatedAt: new Date()
		})
		.where(and(eq(savedAuditQuestions.id, input.id), eq(savedAuditQuestions.organizationId, orgId)))
		.returning();
	return result;
});

export const deleteSavedAuditQuestions = command('unchecked', async (id: string) => {
	const orgId = getOrgId();
	await db.delete(savedAuditQuestions).where(and(eq(savedAuditQuestions.id, id), eq(savedAuditQuestions.organizationId, orgId)));
});
