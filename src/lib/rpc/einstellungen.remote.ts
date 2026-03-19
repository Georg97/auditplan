import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { settings } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { AppSettings } from '$lib/types/settings';

function getOrgId(): string {
	const event = getRequestEvent();
	const orgId = event?.locals?.session?.activeOrganizationId;
	if (!orgId) throw new Error('No active organization');
	return orgId;
}

export const getSettings = query(async () => {
	const orgId = getOrgId();
	const [result] = await db.select().from(settings).where(eq(settings.organizationId, orgId));
	if (!result) return null;
	return JSON.parse(result.data) as AppSettings;
});

export const saveSettings = command('unchecked', async (data: AppSettings) => {
	const orgId = getOrgId();
	const jsonData = JSON.stringify(data);

	const [existing] = await db.select().from(settings).where(eq(settings.organizationId, orgId));

	if (existing) {
		await db.update(settings).set({ data: jsonData, updatedAt: new Date() }).where(eq(settings.organizationId, orgId));
	} else {
		await db.insert(settings).values({
			organizationId: orgId,
			data: jsonData
		});
	}
});
