import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { savedPlans } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

function getOrgId(): string {
	const event = getRequestEvent();
	const orgId = event?.locals?.session?.activeOrganizationId;
	if (!orgId) throw new Error('No active organization');
	return orgId;
}

export const getSavedPlans = query(async () => {
	const orgId = getOrgId();
	return db.select().from(savedPlans).where(eq(savedPlans.organizationId, orgId));
});

export const getSavedPlanById = command('unchecked', async (id: string) => {
	const orgId = getOrgId();
	const [result] = await db
		.select()
		.from(savedPlans)
		.where(and(eq(savedPlans.id, id), eq(savedPlans.organizationId, orgId)));
	return result ?? null;
});

export const savePlan = command('unchecked', async (data: { name: string; daten: string }) => {
	const orgId = getOrgId();
	const [result] = await db
		.insert(savedPlans)
		.values({
			organizationId: orgId,
			name: data.name,
			daten: data.daten
		})
		.returning();
	return result;
});

export const editSavedPlan = command('unchecked', async (input: { id: string; data: { name: string; daten: string } }) => {
	const orgId = getOrgId();
	const [result] = await db
		.update(savedPlans)
		.set({
			name: input.data.name,
			daten: input.data.daten,
			updatedAt: new Date()
		})
		.where(and(eq(savedPlans.id, input.id), eq(savedPlans.organizationId, orgId)))
		.returning();
	return result;
});

export const deleteSavedPlan = command('unchecked', async (id: string) => {
	const orgId = getOrgId();
	await db.delete(savedPlans).where(and(eq(savedPlans.id, id), eq(savedPlans.organizationId, orgId)));
});
