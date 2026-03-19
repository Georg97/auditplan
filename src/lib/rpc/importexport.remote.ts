import { command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { auditors, audits, calendarEntries, actions, savedPlans, savedNotes, savedAuditQuestions, settings } from '../../db/schema';
import { eq } from 'drizzle-orm';

function getOrgId(): string {
	const event = getRequestEvent();
	const orgId = event?.locals?.session?.activeOrganizationId;
	if (!orgId) throw new Error('No active organization');
	return orgId;
}

export const exportAllData = command('unchecked', async (_unused: void) => {
	const orgId = getOrgId();

	const [auditorsData, auditsData, calendarData, actionsData, plansData, notesData, questionsData, settingsData] = await Promise.all([
		db.select().from(auditors).where(eq(auditors.organizationId, orgId)),
		db.select().from(audits).where(eq(audits.organizationId, orgId)),
		db.select().from(calendarEntries).where(eq(calendarEntries.organizationId, orgId)),
		db.select().from(actions).where(eq(actions.organizationId, orgId)),
		db.select().from(savedPlans).where(eq(savedPlans.organizationId, orgId)),
		db.select().from(savedNotes).where(eq(savedNotes.organizationId, orgId)),
		db.select().from(savedAuditQuestions).where(eq(savedAuditQuestions.organizationId, orgId)),
		db.select().from(settings).where(eq(settings.organizationId, orgId))
	]);

	return {
		version: '1.0',
		exportiertAm: new Date().toISOString(),
		auditors: auditorsData,
		audits: auditsData,
		calendar_entries: calendarData,
		actions: actionsData,
		saved_plans: plansData,
		saved_notes: notesData,
		saved_audit_questions: questionsData,
		settings: settingsData
	};
});

export const importData = command('unchecked', async (data: Record<string, unknown[]>) => {
	const orgId = getOrgId();
	const result: Record<string, number> = {};
	const errors: string[] = [];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const tableMap: Record<string, any> = {
		auditors,
		audits,
		calendar_entries: calendarEntries,
		actions,
		saved_plans: savedPlans,
		saved_notes: savedNotes,
		saved_audit_questions: savedAuditQuestions,
		settings
	};

	for (const [key, rows] of Object.entries(data)) {
		const table = tableMap[key as keyof typeof tableMap];
		if (!table || !Array.isArray(rows)) continue;

		let count = 0;
		for (const row of rows) {
			try {
				const record = row as Record<string, unknown>;
				// Strip id and set organizationId to current org
				const { id: _id, organizationId: _orgId, ...rest } = record;
				await db.insert(table).values({ ...rest, organizationId: orgId } as never);
				count++;
			} catch {
				errors.push(`${key}: Import eines Eintrags fehlgeschlagen`);
			}
		}
		result[key] = count;
	}

	return { result, errors };
});
