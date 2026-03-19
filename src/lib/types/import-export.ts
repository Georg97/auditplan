import { z } from 'zod';

export const exportKeysValues = ['audits', 'auditors', 'saved_plans', 'saved_notes', 'calendar_entries', 'actions', 'settings'] as const;
export type ExportKey = (typeof exportKeysValues)[number];

export const exportDataSchema = z.object({
	version: z.string(),
	exportedAt: z.string(),
	organization: z.string(),
	audits: z.array(z.record(z.string(), z.unknown())).optional().default([]),
	auditors: z.array(z.record(z.string(), z.unknown())).optional().default([]),
	saved_plans: z.array(z.record(z.string(), z.unknown())).optional().default([]),
	saved_notes: z.array(z.record(z.string(), z.unknown())).optional().default([]),
	calendar_entries: z.array(z.record(z.string(), z.unknown())).optional().default([]),
	actions: z.array(z.record(z.string(), z.unknown())).optional().default([]),
	settings: z.array(z.record(z.string(), z.unknown())).optional().default([])
});
export type ExportData = z.infer<typeof exportDataSchema>;

export const importResultSchema = z.object({
	success: z.boolean(),
	importedKeys: z.array(z.string()),
	skippedKeys: z.array(z.string()),
	errors: z.array(z.string()),
	counts: z.record(z.string(), z.number())
});
export type ImportResult = z.infer<typeof importResultSchema>;
