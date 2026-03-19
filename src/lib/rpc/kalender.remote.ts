import { command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { calendarEntries } from '../../db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import type { CalendarEntryFormData } from '$lib/types/calendar';

function getOrgId(): string {
	const event = getRequestEvent();
	const orgId = event?.locals?.session?.activeOrganizationId;
	if (!orgId) throw new Error('No active organization');
	return orgId;
}

export const getCalendarEntries = command('unchecked', async (range: { startDatum: string; endDatum: string }) => {
	const { startDatum, endDatum } = range;
	const orgId = getOrgId();
	return db
		.select()
		.from(calendarEntries)
		.where(and(eq(calendarEntries.organizationId, orgId), gte(calendarEntries.datum, startDatum), lte(calendarEntries.datum, endDatum)));
});

export const addCalendarEntry = command('unchecked', async (data: CalendarEntryFormData) => {
	const orgId = getOrgId();
	const [result] = await db
		.insert(calendarEntries)
		.values({
			...data,
			organizationId: orgId
		})
		.returning();
	return result;
});

export const editCalendarEntry = command('unchecked', async (input: { id: string; data: CalendarEntryFormData }) => {
	const orgId = getOrgId();
	const [result] = await db
		.update(calendarEntries)
		.set({
			...input.data,
			updatedAt: new Date()
		})
		.where(and(eq(calendarEntries.id, input.id), eq(calendarEntries.organizationId, orgId)))
		.returning();
	return result;
});

export const deleteCalendarEntry = command('unchecked', async (id: string) => {
	const orgId = getOrgId();
	await db.delete(calendarEntries).where(and(eq(calendarEntries.id, id), eq(calendarEntries.organizationId, orgId)));
});
