import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { actions } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import type { ActionFormData } from '$lib/types/action';

function getOrgId(): string {
	const event = getRequestEvent();
	const orgId = event?.locals?.session?.activeOrganizationId;
	if (!orgId) throw new Error('No active organization');
	return orgId;
}

export const getActions = query(async () => {
	const orgId = getOrgId();
	return db.select().from(actions).where(eq(actions.organizationId, orgId));
});

export const addAction = command('unchecked', async (data: ActionFormData) => {
	const orgId = getOrgId();
	const [result] = await db
		.insert(actions)
		.values({
			...data,
			organizationId: orgId
		})
		.returning();
	return result;
});

export const editAction = command('unchecked', async (input: { id: string; data: ActionFormData }) => {
	const orgId = getOrgId();
	const [result] = await db
		.update(actions)
		.set({
			...input.data,
			updatedAt: new Date()
		})
		.where(and(eq(actions.id, input.id), eq(actions.organizationId, orgId)))
		.returning();
	return result;
});

export const deleteAction = command('unchecked', async (id: string) => {
	const orgId = getOrgId();
	await db.delete(actions).where(and(eq(actions.id, id), eq(actions.organizationId, orgId)));
});
