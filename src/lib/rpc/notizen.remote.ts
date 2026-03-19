import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { savedNotes } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

function getOrgId(): string {
	const event = getRequestEvent();
	const orgId = event?.locals?.session?.activeOrganizationId;
	if (!orgId) throw new Error('No active organization');
	return orgId;
}

export const getSavedNotes = query(async () => {
	const orgId = getOrgId();
	return db.select().from(savedNotes).where(eq(savedNotes.organizationId, orgId));
});

export const getSavedNotesById = command('unchecked', async (id: string) => {
	const orgId = getOrgId();
	const [result] = await db
		.select()
		.from(savedNotes)
		.where(and(eq(savedNotes.id, id), eq(savedNotes.organizationId, orgId)));
	return result ?? null;
});

export const saveNotes = command('unchecked', async (data: { name: string; daten: string }) => {
	const orgId = getOrgId();
	const [result] = await db
		.insert(savedNotes)
		.values({
			organizationId: orgId,
			name: data.name,
			daten: data.daten
		})
		.returning();
	return result;
});

export const editSavedNotes = command('unchecked', async (input: { id: string; data: { name: string; daten: string } }) => {
	const orgId = getOrgId();
	const [result] = await db
		.update(savedNotes)
		.set({
			name: input.data.name,
			daten: input.data.daten,
			updatedAt: new Date()
		})
		.where(and(eq(savedNotes.id, input.id), eq(savedNotes.organizationId, orgId)))
		.returning();
	return result;
});

export const deleteSavedNotes = command('unchecked', async (id: string) => {
	const orgId = getOrgId();
	await db.delete(savedNotes).where(and(eq(savedNotes.id, id), eq(savedNotes.organizationId, orgId)));
});
