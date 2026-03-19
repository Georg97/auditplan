import { z } from 'zod';

export const calendarEntrySchema = z.object({
	id: z.string(),
	organizationId: z.string(),
	title: z.string().min(1),
	description: z.string().nullable().optional(),
	date: z.string().min(1),
	startTime: z.string().nullable().optional(),
	endTime: z.string().nullable().optional(),
	allDay: z.boolean().optional().default(false),
	auditId: z.string().nullable().optional(),
	color: z.string().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});

export type CalendarEntry = z.infer<typeof calendarEntrySchema>;

export const calendarEntryCreateSchema = calendarEntrySchema.omit({
	id: true,
	organizationId: true,
	createdAt: true,
	updatedAt: true
});

export type CalendarEntryCreate = z.infer<typeof calendarEntryCreateSchema>;

export const calendarEntryUpdateSchema = calendarEntryCreateSchema.partial();

export type CalendarEntryUpdate = z.infer<typeof calendarEntryUpdateSchema>;
